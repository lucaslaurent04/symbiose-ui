#bash shebang
#!/bin/bash
sudo rm -rf .angular && npm run build && cp ../equal-ui/equal.bundle.js ./dist/sb-shared-lib/
