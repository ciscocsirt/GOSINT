# GOSINT - Open Source Threat Intelligence Gathering and Processing Framework

The GOSINT framework is a project used for collecting, processing, and exporting high quality indicators of compromise (IOCs). GOSINT
allows a security analyst to collect and standardize structured and unstructured threat intelligence. Applying threat intelligence to security operations enriches alert data with additional confidence, context, and co-occurrence. This means that you apply research
from third parties to security event data to identify similar, or identical, indicators of malicious behavior. The framework is written in Go with a JavaScript frontend.

![Alt Text](https://github.com/ciscocsirt/GOSINT/blob/master/gosint.gif)

----------------
## Installation

Please find the installation procedure at http://gosint.readthedocs.io/en/latest/installation.html

There are three ways to get up and running:

1. [Bash install script](http://gosint.readthedocs.io/en/latest/installation.html#bash-install)
2. [Docker](http://gosint.readthedocs.io/en/latest/installation.html#docker)
3. [Manual installation](http://gosint.readthedocs.io/en/latest/installation.html#manual-install)

----------------

## Updates

Updating is simple and encouraged as bugs are reported and fixed or new features are added.  To update your instance of GOSINT, pull the latest version of GOSINT from the repository and re-run the build command to compile the updated binary.

```
godep go build -o gosint
```

----------------

## Configuration

GOSINT needs some quick initial configuration to start making use of the framework features.  All the settings you will need to specify can be found under the "Settings" tab.  

Please find the configuration procedure at http://gosint.readthedocs.io/en/latest/configuration.html

----------------

## Use

Please find the instructions for use at http://gosint.readthedocs.io/en/latest/use.html
