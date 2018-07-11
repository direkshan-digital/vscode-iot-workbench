import {ResourceManagementClient, ResourceModels, SubscriptionClient} from 'azure-arm-resource';
import * as fs from 'fs-plus';
import {ServiceClientCredentials} from 'ms-rest';
import * as path from 'path';
import * as vscode from 'vscode';

import {AzureAccount, AzureResourceFilter} from '../azure-account.api';
import {ConfigHandler} from '../configHandler';

import {getExtension} from './Apis';
import {extensionName} from './Interfaces/Api';

export interface ARMParameters {
  [key: string]: {value: string|number|boolean|null};
}

export interface ARMParameterTemplateValue {
  type: string;
  defaultValue?: string|number|boolean|{}|Array<{}>|null;
  allowedValues?: Array<string|number|boolean|null>;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ARMParameterTemplate {
  [key: string]: ARMParameterTemplateValue;
}

export interface ARMTemplate { parameters: ARMParameterTemplate; }

export class Azure {
  constructor(
      private _context: vscode.ExtensionContext,
      private _channel?: vscode.OutputChannel, subscriptionId?: string) {
    if (subscriptionId) {
      this._subscriptionId = subscriptionId;
    }
  }

  private _subscriptionId: string|undefined = undefined;

  private _azureAccountExtension: AzureAccount|undefined =
      getExtension(extensionName.AzureAccount);

  private async _getSubscriptionList(): Promise<vscode.QuickPickItem[]> {
    const subscriptionList: vscode.QuickPickItem[] = [];
    if (!this._azureAccountExtension) {
      throw new Error('Azure account extension is not found.');
    }

    const subscriptions = this._azureAccountExtension.filters;
    subscriptions.forEach(item => {
      subscriptionList.push({
        label: item.subscription.displayName,
        description: item.subscription.subscriptionId
      } as vscode.QuickPickItem);
    });

    if (subscriptionList.length === 0) {
      subscriptionList.push({
        label: 'No subscription found',
        description: '',
        detail:
            'Click Azure account at bottom left corner and choose Select All'
      } as vscode.QuickPickItem);
    }

    return subscriptionList;
  }

  private async _getCredential(): Promise<ServiceClientCredentials|undefined> {
    this._subscriptionId = await this._getSubscription();

    if (!this._azureAccountExtension) {
      throw new Error('Azure account extension is not found.');
    }

    if (!this._subscriptionId) {
      return undefined;
    }

    const subscriptions: AzureResourceFilter[] =
        this._azureAccountExtension.filters;
    for (let i = 0; i < subscriptions.length; i++) {
      const subscription: AzureResourceFilter = subscriptions[i];
      if (subscription.subscription.subscriptionId === this._subscriptionId) {
        return subscription.session.credentials;
      }
    }

    return undefined;
  }

  private async _getResourceClient() {
    this._subscriptionId = await this._getSubscription();

    if (!this._subscriptionId) {
      return undefined;
    }

    const credential = await this._getCredential();
    if (credential) {
      const client =
          new ResourceManagementClient(credential, this._subscriptionId);
      return client;
    }
    return undefined;
  }

  private async _getSubscriptionClient() {
    const credential = await this._getCredential();
    if (credential) {
      const client = new SubscriptionClient(credential);
      return client;
    }
    return undefined;
  }

  private async _getLocations() {
    this._subscriptionId = await this._getSubscription();

    if (!this._subscriptionId) {
      return undefined;
    }

    const client = await this._getSubscriptionClient();
    if (!client) {
      return undefined;
    }

    const locations =
        await client.subscriptions.listLocations(this._subscriptionId);
    return locations;
  }

  private async _createResouceGroup() {
    const client = await this._getResourceClient();
    if (!client) {
      return undefined;
    }

    const resourceGroupName = await vscode.window.showInputBox({
      prompt: 'Input resouce group name',
      ignoreFocusOut: true,
      validateInput: async (name: string) => {
        if (!/^[a-z0-9_\-\.]*[a-z0-9_\-]+$/.test(name)) {
          return 'Resource group names only allow alphanumeric characters, periods, underscores, hyphens and parenthesis and cannot end in a period.';
        }

        const exist = await client.resourceGroups.checkExistence(name);
        if (exist) {
          return 'This name is unavailable';
        }

        return '';
      }
    });

    if (!resourceGroupName) {
      return undefined;
    }

    const locations = await this._getLocations();
    if (!locations) {
      return undefined;
    }
    const locationList: vscode.QuickPickItem[] = [];
    for (const location of locations) {
      locationList.push({
        label: location.displayName as string,
        description: location.name as string
      });
    }

    const resourceGroupLocation = await vscode.window.showQuickPick(
        locationList,
        {placeHolder: 'Select Resource Group Location', ignoreFocusOut: true});
    if (!resourceGroupLocation) {
      return undefined;
    }

    const resourceGroup = await client.resourceGroups.createOrUpdate(
        resourceGroupName, {location: resourceGroupLocation.description});

    return resourceGroup.name;
  }

  private _commonParameterCheck(
      _value: string, parameter: ARMParameterTemplateValue) {
    let value: string|number|boolean|null = null;
    switch (parameter.type.toLocaleLowerCase()) {
      case 'string':
        value = _value;
        break;
      case 'int':
        value = Number(_value);
        break;
      case 'bool':
        value = _value.toLocaleLowerCase() === 'true';
        break;
      default:
        break;
    }

    if (value === null) {
      return '';
    }

    if (typeof value === 'string' && parameter.minLength !== undefined &&
        parameter.minLength > value.length) {
      return `The value does\'t meet requirement: minLength ${
          parameter.minLength}.`;
    }

    if (typeof value === 'string' && parameter.maxLength !== undefined &&
        parameter.maxLength < value.length) {
      return `The value does\'t meet requirement: maxLength ${
          parameter.maxLength}.`;
    }

    if (typeof value === 'number' && parameter.minValue !== undefined &&
        parameter.minValue > value) {
      return `The value does\'t meet requirement: minValue ${
          parameter.minValue}.`;
    }

    if (typeof value === 'number' && parameter.maxValue !== undefined &&
        parameter.maxValue < value) {
      return `The value does\'t meet requirement: maxValue ${
          parameter.maxValue}.`;
    }

    if (typeof value === 'number' && isNaN(value)) {
      return `The value is not a valid number.`;
    }

    return '';
  }

  private async _getARMParameters(parameterTemplate: ARMParameterTemplate) {
    const parameters: ARMParameters = {};
    for (const key of Object.keys(parameterTemplate)) {
      const parameter = parameterTemplate[key];
      let value: string|number|boolean|null = null;
      let inputValue = '';

      if (parameter.allowedValues) {
        const values: vscode.QuickPickItem[] = [];
        for (const value of parameter.allowedValues) {
          if (value !== null) {
            values.push({label: value.toString(), description: ''});
          }
        }

        const _value = await vscode.window.showQuickPick(
            values,
            {placeHolder: `Select value of ${key}`, ignoreFocusOut: true});
        if (!_value) {
          return undefined;
        }

        inputValue = _value.label;
      } else if (key.substr(0, 2) === '$$') {
        // Read value from file
        if (!vscode.workspace.workspaceFolders) {
          inputValue = '';
        } else {
          const _key = key.substr(2);
          const filePath = path.join(
              vscode.workspace.workspaceFolders[0].uri.fsPath, '..', _key);
          this._context.asAbsolutePath(_key);
          if (fs.existsSync(filePath)) {
            inputValue = fs.readFileSync(filePath, 'utf8');
          } else {
            inputValue = '';
          }
        }
      } else if (key.substr(0, 1) === '$') {
        // Read value from workspace config
        const _key = key.substr(1);

        const iothubConnectionString =
            ConfigHandler.get<string>('iothubConnectionString');

        switch (_key) {
          case 'iotHubName':
            if (!iothubConnectionString) {
              inputValue = '';
            } else {
              const iotHubNameMatches =
                  iothubConnectionString.match(/HostName=(.*?)\./);
              if (!iotHubNameMatches) {
                inputValue = '';
              } else {
                inputValue = iotHubNameMatches[1];
              }
            }
            break;
          case 'iotHubKeyName':
            if (!iothubConnectionString) {
              inputValue = '';
            } else {
              const iotHubKeyNameMatches = iothubConnectionString.match(
                  /SharedAccessKeyName=(.*?)(;|$)/);
              if (!iotHubKeyNameMatches) {
                inputValue = '';
              } else {
                inputValue = iotHubKeyNameMatches[1];
              }
            }
            break;
          case 'iotHubKey':
            if (!iothubConnectionString) {
              inputValue = '';
            } else {
              const iotHubKeyMatches =
                  iothubConnectionString.match(/SharedAccessKey=(.*?)(;|$)/);
              if (!iotHubKeyMatches) {
                inputValue = '';
              } else {
                inputValue = iotHubKeyMatches[1];
              }
            }
            break;
          case 'subscription':
            inputValue = this._subscriptionId || '';
            break;
          default:
            const _value = ConfigHandler.get<string>(_key);
            if (!_value) {
              inputValue = '';
            } else {
              inputValue = _value;
            }
        }
      } else {
        const _value = await vscode.window.showInputBox({
          prompt: `Input value for ${key}`,
          ignoreFocusOut: true,
          value: parameter.defaultValue ? parameter.defaultValue.toString() :
                                          '',
          validateInput: async (value: string) => {
            return this._commonParameterCheck(value, parameter);
          }
        });

        if (!_value) {
          return undefined;
        }

        inputValue = _value;
      }

      switch (parameter.type.toLocaleLowerCase()) {
        case 'string':
          value = inputValue;
          break;
        case 'int':
          value = Number(inputValue);
          break;
        case 'bool':
          value = inputValue.toLocaleLowerCase() === 'true';
          break;
        default:
          break;
      }

      parameters[key] = {value};
    }

    return parameters;
  }

  private async _getSubscription() {
    if (this._subscriptionId) {
      return this._subscriptionId;
    }

    const subscription = await vscode.window.showQuickPick(
        this._getSubscriptionList(),
        {placeHolder: 'Select Subscription', ignoreFocusOut: true});
    if (!subscription || !subscription.description) {
      return undefined;
    }
    return subscription.description;
  }

  private async _getResourceGroupItems() {
    const client = await this._getResourceClient();

    if (!client) {
      return [];
    }

    const resourceGrouplist: vscode.QuickPickItem[] =
        [{label: '$(plus) Create Resource Group', description: '', detail: ''}];

    const resourceGroups = await client.resourceGroups.list();

    for (const resourceGroup of resourceGroups) {
      resourceGrouplist.push({
        label: resourceGroup.name as string,
        description: resourceGroup.location,
        detail: ''
      });
    }

    return resourceGrouplist;
  }

  async getResourceGroup() {
    const client = await this._getResourceClient();

    if (!client) {
      return undefined;
    }

    const choice = await vscode.window.showQuickPick(
        this._getResourceGroupItems(),
        {placeHolder: 'Select Resource Group', ignoreFocusOut: true});

    if (!choice) {
      return undefined;
    }

    if (choice.description === '') {
      return this._createResouceGroup();
    } else {
      return choice.label;
    }
  }

  async deployARMTemplate(template: ARMTemplate) {
    const client = await this._getResourceClient();
    if (!client) {
      return undefined;
    }

    const resourceGroup = await this.getResourceGroup();
    if (!resourceGroup) {
      return undefined;
    }

    const parameters = await this._getARMParameters(template.parameters);
    if (!parameters) {
      return undefined;
    }

    const mode = 'Incremental';
    const deploymentParameters:
        ResourceModels.Deployment = {properties: {parameters, template, mode}};

    const deployment = await client.deployments.createOrUpdate(
        resourceGroup, `IoTWorkbecnhDeploy${new Date().getTime()}`,
        deploymentParameters);
    return deployment;
  }
}