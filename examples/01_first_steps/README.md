# Before we begin

As mentioned earlier, we will need some software ready and runnign for these examples and exercises.

## Get Software

We will not delve to deep into the preparations of such software. However here are a few tips:
- Get NodeJS so you can do the exercises based in JS [Download Node](https://nodejs.org/en/download)
- Download InfluxDB (Version 1.x and binaries, avoid versions 2 and 3 or automated installers). [InfluxDB Download page](https://docs.influxdata.com/influxdb/v1/introduction/download/)
- Download Grafana standalone Binaries, avoid installers. (Grafana downloads)[https://grafana.com/grafana/download]
- Download k6 using brew or winget. [k6 instructions](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- Install the Selenium Javascript Web API and the chrome drivers (or your prefered browser's). [Selenium JS API link](https://www.selenium.dev/selenium/docs/api/javascript/)

## Why binaries

Generally I prefer binaries for these exercises as installers tend to leave the software running in your machines and consuming resources. If you prefer an installer that is fine but beware I feel there's less control. Also some of the software can be executed through binaries even if you are in a company laptop.

## Again on Influx

I will keep repeating this. *Get Influx Version 1.X*

I repeat. Get 1. *NOT 2 or 3*

This is because version 1 is so much easier to work with and to exemplify.

Before doing the exercises make sure to create in influx a database for the exercises. The name we will use is ObserQAbility.

## Grafana

Once you are in Grafana, create a data source for the influx server and the database we created above.

The used visualizations will be included as json files.

# Your first instrumentation

Here you will not use Client Libraries nor Agents. We will create our own instrumentation as a JavaScript function.

Then we will import that JS into the software.

Here you can get the instrumentation function.

[INSTRUMENTATION JavaScript](./instrument.js)

This is just a simple function that you can import in other JavaScripts that we will be using.

The function recevies:
 - The name of the measurement where you will store the data (a measurement is the "Table" where you will store)
 - The name of the metric you are going to store
 - A status if you want to indicate with numbers. IE. 0=Fail, 1=Pass
 - A metric, being the value you want to store like response time, number of users, stored amount, etc.
 - Error message in case an error appears you will be able to log it.

 Then we will assemble the post. It will be sent to localhost, and to port 8086 (Influx's port), with a write function to the database ObserQAbility.

 After that you have the error handling options adn reporting.

 Last the post to the database.

 Feel free to modify the function, this is just a template to give you an idea, but the sky is the limit.

 ## Trying it out

 Check and run tryInstrument.js

 It just sends a test data which should be received by influx. If the script indicates that the test passed, you can query it at: [http://localhost:8086/query?db=ObserQAbility&pretty=true&q=SELECT * FROM TestMeasure](http://localhost:8086/query?db=ObserQAbility&pretty=true&q=SELECT * FROM TestMeasure)

 ## Visualizing

 In Grafana, you can create a Dashboard and add a visualization that queries as above. Keep it simple as it is just an initiation. We will get more interesting further.

 