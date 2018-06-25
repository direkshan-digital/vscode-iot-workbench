# Azure IoT Workbench <sup>preview</sup> for Visual Studio Code

[![Gitter](https://img.shields.io/badge/chat-on%20gitter-blue.svg)](https://gitter.im/Microsoft/vscode-iot-workbench)
[![Travis CI](https://travis-ci.org/Microsoft/vscode-iot-workbench.svg?branch=master)](https://travis-ci.org/Microsoft/vscode-iot-workbench)

Welcome to **Azure IoT Workbench** <sup>preview</sup> for Visual Studio Code! The IoT Workbench extension makes it easy to code, build, deploy and debug your IoT project in Visual Studio Code, with a rich set of functionalities.

## Prerequisites

IoT Workbench aims to support multiple popular IoT development boards and kits. It currently supports following IoT hardware:

- [MXChip IoT DevKit](https://aka.ms/iot-devkit)
- [teXXmo IoT button](https://aka.ms/button)

Please find the [Setup Guide](#setup-guide) section below to configure your hardware.

## Installation
Open VS Code and press `F1` or `Ctrl + Shift + P` to open command palette, select **Install Extension** and type `iot-workbench`.

Or launch VS Code Quick Open (`Ctrl + P`), paste the following command, and press enter.
```bash
ext install vscode-iot-workbench
```

After installation, please reload the window and make sure all the dependency extensions are correctly installed.

## Supported Operating Systems
Currently this extension supports the following operatings systems:

- Windows 7 and later (32-bit and 64-bit)
- macOS 10.10 and later

## Setup Guide

### MXChip IoT DevKit

Please follow the [guide](docs/iot-devkit.md) to setup IoT DevKit.
Here are a set of tutorials that will help you get started:
* [Get Started](./docs/iot-devkit/devkit-get-started.md)
* [Shake, Shake for a Tweet](./docs/iot-devkit/devkit-shakeshake.md)
* [Remote Monitoring](./docs/iot-devkit/devkit_remote_monitoringv2.md)
* [DevKit Translator](./docs/iot-devkit/devkit-translator.md)
* [MQTT Client](./docs/iot-devkit/devkit-mqtt-client.md)
* [DevKit State](./docs/iot-devkit/devkit-state.md)
* [Door Monitor](./docs/iot-devkit/devkit_door_monitor.md)

### teXXmo IoT button
Here are a set of tutorials that will help you get started:
* [Get Started](./docs/iot-button/teXXmo_IoT_button_get_started.md)

## Commands

| Command | Description |
| --- | --- |
| `IoT Workbench: New`  | Create new IoT Workbench projects. |
| `IoT Workbench: Examples` | Load existing examples of IoT Workbench project. |
| `IoT Workbench: Cloud` | Provison Azure services and deploy Azure Functions. |
| `IoT Workbench: Device`  | Compile, upload device code and config device settings. |
| `IoT Workbench: Set Workbench Path` | Set the default path for IoT Workbench. |
| `IoT Workbench: Help` | Open help URL. |

### Create New Project

<img width="760" src="https://raw.githubusercontent.com/Microsoft/vscode-iot-workbench/master/gif/new.gif">

### Provision Azure Service

<img width="760" src="https://raw.githubusercontent.com/Microsoft/vscode-iot-workbench/master/gif/provision.gif">

### Example Gallery

<img width="760" src="https://raw.githubusercontent.com/Microsoft/vscode-iot-workbench/master/gif/example.gif">

#### Note: 
When invoking the **Azure Provision** command with Azure IoT Hub and Azure Functions, by default, Azure Functions would use the IoT Hub consumer group of `$Default`. To switch to another consumer group, please follow the [guide](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal) to create a new consumer group in Azure Poral. Then in IoT project, modify the following setting in **function.json**:
```
"consumerGroup": "[consumer_group_name]"
```

## Privacy Statement
The [Microsft Enterprise and Developer Privacy Statement](https://www.microsoft.com/en-us/privacystatement/EnterpriseDev/default.aspx) describes the privacy statement of this software.

## Contributing
There are a couple of ways you can contribute to this repo:

- **Ideas, feature requests and bugs**: We are open to all ideas and we want to get rid of bugs! Use the Issues section to either report a new issue, provide your ideas or contribute to existing threads.
- **Documentation**: Found a typo or strangely worded sentences? Submit a PR!
- **Code**: Contribute bug fixes, features or design changes:
  - Clone the repository locally and open in VS Code.
  - Install [TSLint for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=eg2.tslint).
  - Open the terminal (press <code>Ctrl + &#96;</code>) and run `npm install`.
  - To build, press `F1` and type in `Tasks: Run Build Task`.
  - Debug: press `F5` to start debugging the extension.
  - Run `gts check` and `gts fix` to follow TypeScript style guide.  

## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct). For more information please see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/#howadopt) or contact opencode@microsoft.com with any additional questions or comments.

## Contact Us
If you would like to help to build the best IoT experience with IoT Workbench, you can reach us directly at [gitter chat room](https://gitter.im/Microsoft/vscode-iot-workbench).

## Telemetry
VS Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409) to learn more. If you don’t wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in our [FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).


