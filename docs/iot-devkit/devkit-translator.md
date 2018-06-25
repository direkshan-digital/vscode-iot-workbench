# Use IoT DevKit AZ3166 with Azure Functions and Cognitive Services to make a language translator

In this tutorial, you learn how to make IoT DevKit as a language translator by using [Azure Cognitive Services](https://azure.microsoft.com/services/cognitive-services/). It records your voice and translates it to English text shown on the DevKit screen.

## About IoT DevKit

The [MXChip IoT DevKit](https://aka.ms/iot-devkit) (a.k.a. IoT DevKit) is an all-in-one Arduino compatible board with rich peripherals and sensors. You can develop for it using [Azure IoT Workbench ](https://aka.ms/azure-iot-workbench). And it comes with a growing [projects catalog](https://aka.ms/devkit/project-catalog) to guide you prototype Internet of Things (IoT) solutions that take advantage of Microsoft Azure services.

## What you need

Finish the [Getting Started Guide](./devkit-get-started.md) to:

* Have your DevKit connected to Wi-Fi.
* Prepare the development environment.

An active Azure subscription. If you do not have one, you can register via one of these two methods:

* Activate a [free 30-day trial Microsoft Azure account](https://azure.microsoft.com/free/).
* Claim your [Azure credit](https://azure.microsoft.com/pricing/member-offers/msdn-benefits-details/) if you are MSDN or Visual Studio subscriber.

## Open the project folder

### Start VS Code

* Make sure your DevKit is not connected to your PC.
* Start VS Code.
* Connect the IoT DevKit to your computer.
* Make sure [Azure IoT Workbench](https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-iot-workbench) is installed.

### Open IoT Workbench Examples

Use `F1` or `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) to open the command palette, type **IoT Workbench**, and then select **IoT Workbench: Examples**.

![IoT Workbench: Examples](media/iot-workbench-examples-cmd.png)

Select **IoT DevKit**.

![IoT Workbench: Examples -> Select board](media/iot-workbench-examples-board.png)

Then the **IoT Workbench Example** window is showed up.

![IoT Workbench, Examples window](media/iot-workbench-examples.png)

Find **DevKit Translator** and click **Open Sample** button. A new VS Code window with a project folder in it opens.

![IoT Workbench, select DevKit Translator example](media/devkit-translator/iot-workbench-example.png)

## Provision Cognitive Service
  1. Login to http://portal.azure.com
  1. Select the **+ New** option.
  1. Select **AI + Machine Learning** from the list of services.
  1. Select **Translator Speech**. You may need to click "See all" or search to see it.
	![create speech service](media/devkit-translator/create-speech-api.jpg)
  1. Fill out the rest of the form, and click the **Create** button.
  1. You are now subscribed to Microsoft Translator Speech API.
  1. Go to **All Resources** and select the Microsoft Translator you created.
  1. Go to the **Keys** option and copy your subscription key to access the service. We will use that value in later sections.
	![get speech key](media/devkit-translator/speech-key.jpg)

## Provision Azure services

In the solution window, open the command palette and select **IoT Workbench: Cloud**.

![IoT Workbench: Cloud](media/iot-workbench-cloud.png)

Select **Azure Provision**.

![IoT Workbench: Cloud -> Provision](media/iot-workbench-cloud-provision.png)

Then VS Code guides you through provisioning the required Azure services.

![IoT Workbench: Cloud -> Provision steps](media/iot-workbench-cloud-provision-steps3.png)

The whole process includes:
* Select an existing IoT Hub or create a new IoT Hub.
* Select an existing IoT Hub device or create a new IoT Hub device. 
* Create a new Function App.

Please take a note of the device name you created. It will be used in next section.

## Modify code for Azure Functions
Open **devkit-traslater\run.csx** and modify the following line with the device name and subscription key you provisioned in previous step:
```cpp
    string subscriptionKey = "";
    string deviceName = "";
```

## Deploy Azure Functions

Open the command palette and select **IoT Workbench: Cloud**, then select **Azure Deploy**.

![IoT Workbench: Cloud -> Deploy](media/iot-workbench-cloud-deploy.png)

After the Function deploys successfully, fill in the azure_config.h file with Function App name. 

![Update the function app name](media/devkit-translator/update-app-name.png)

You can get back the Function App name from the VS Code **OUTPUT** window if you forgot it.

![Get back the function app name](media/devkit-translator/azure-function.png)

> Note: If the Function App does not work properly, check this [FAQs](https://microsoft.github.io/azure-iot-developer-kit/docs/faq#compilation-error-for-azure-function) section to resolve it.

## Config IoT Hub Connection String

1. Switch the IoT DevKit into **Configuration mode**. To do so:

   - Hold down button **A**.
   - Push and release the **Reset** button.

2. The screen displays the DevKit ID and 'Configuration'.

	![IoT DevKit Configuration Mode](media/devkit-configuration-mode.png) 

3. Open the command palette and select **IoT Workbench: Device**.

	![IoT Workbench: Device](media/iot-workbench-device.png)

4. Select **Config Device Settings**.

	![IoT Workbench: Device -> Settings](media/iot-workbench-device-settings.png)

5. Select **Select IoT Hub Device Connection String**.

	![IoT Workbench: Device -> Connection string](media/iot-workbench-device-string1.png)

	This sets the connection string that is retrieved from the `Provision Azure services` step.

6. The configuration success notification popup bottom right corner once it's done.

    ![IoT DevKit Connection String OK](media/iot-workbench-connection-done.png) 

## Build and upload the device code

1. Open the command palette and select **IoT Workbench: Device**, then select **Device Upload**.

	![IoT Workbench: Device -> Upload](media/iot-workbench-device-upload.png)

2. VS Code then starts verifying and uploading the code to your DevKit.

	![IoT Workbench: Device -> Uploaded](media/devkit-translator/iot-workbench-device-uploaded.png)

3. The IoT DevKit reboots and starts running the code.


## Test the project

After app initialization, follow the instructions on the DevKit screen. The default source language is Chinese.

To select another language for translation:

1. Press button **A** to enter setup mode.

2. Press button **B** to scroll all supported source languages.
   
	![Select language](media/devkit-translator/select-language.png)

3. Press button **A** to confirm your choice of source language.

4. Press and hold button **B** while speaking, then release button **B** to initiate the translation.


5. The translated text in English shows on the screen.
   
	![Translation result](media/devkit-translator/translation-result.png)

6. On the translation result screen, you can:
	- Press button **A** and **B** to scroll and select the source language.
	- Press button **B** to talk, release to send the voice and get the translation text.

## How it works

![diagram](media/devkit-translator/diagram.png)

The IoT DevKit records your voice then posts an HTTP request to trigger Azure Functions. Azure Functions calls the cognitive service speech translator API to do the translation. After Azure Functions gets the translation text, it sends a C2D message to the device. Then the translation is displayed on the screen.

## Problems and feedback

If you encounter problems, refer to [FAQs](https://microsoft.github.io/azure-iot-developer-kit/docs/faq/) or reach out to us from the following channels:

* [Gitter.im](http://gitter.im/Microsoft/azure-iot-developer-kit)
* [Stackoverflow](https://stackoverflow.com/questions/tagged/iot-devkit)

## Next Steps

Now you make the IoT DevKit as a translator by using Azure Functions and Cognitive Services. In this tutorial, you learned how to:

- [x] Use Azure IoT Workbench to build a Azure IoT solution includes both device and cloud.
- [x] Configure Azure IoT device connection string.
- [x] Deploy Azure Functions.
- [x] Test the voice message translation.

Check our [Projects Catalog](https://aka.ms/devkit/project-catalog) for more samples you can build with the IoT DevKit and Azure multiple services.