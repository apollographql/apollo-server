---
title: Deploying with Flightcontrol
---

Flightcontrol automates deployments to your AWS account, and gives you full access to inspect and change settings without any limitations.

## Prerequisites

Make sure you've completed the following before proceeding with this guide:

- [Get started with Apollo Server](../getting-started)
- [Create a Flightcontrol account](https://www.flightcontrol.dev?ref=apollo)
- [Create an AWS account](https://aws.amazon.com/)
- Add a [health check](../monitoring/health-checks)

## How to Deploy

1. Go to [app.flightcontrol.dev/projects/new/1](https://app.flightcontrol.dev/projects/new/1?ref=apollo)
2. Connect your GitHub account and select your repo
3. Select your desired Config Type:
    - `GUI` (all config managed through Flightcontrol dashboard)
    - `flightcontrol.json` ("Infrastructure as Code" option where all config is in your repo)
4. Set the health check path on Flightcontrol
4. Adjust configuration as needed
5. Click "Create Project" and complete any required steps (like linking your AWS account).

## Note

For more Information visit [Flightcontrol documentation](https://www.flightcontrol.dev/docs?ref=apollo)
