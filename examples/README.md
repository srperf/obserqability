# ObserQAbility examples

In this section I will list some examples I have thought on how to apply obserQAbility. But again these are no all there is, if you think of other options please let me know.

## Software we will need

For these examples I want you to understand the priciples of o11y, so almost everything will be done manually. We could use Agents or Client Libraries (CL) but I prefer to show you the guts and principles so that when you use automated o11y, you know what is happening.

We will use open and free software here!
- JavaScript to code (mostly cause I like it and I feel it universal)
- InfluxDB to store data (*PLEASE GET V1.x! AVOID VERSIONS 2 & 3*)
- Grafana to visualize everything
- k6 for QA of APIs and some performance
- Selenium for functional automations

## Software we will test

I have created a few examples of webpages and services that we will be using, together with code which will allow us to instrument oue software. They are also in JavaScript, so you should have Node at hand.

## Examples

- [First steps](./01_first_steps/README.md)
- QA automations inside of o11y
- o11y inside of QA automations
- Software error detection wit o11y
- Automation's health with o11y
- UX and user QA status
- Performance & Reliability

