#!/bin/bash
echo apps
(cd ./apps/ ; sh export.sh)
echo auth
(cd ./auth/ ; sh export.sh)
echo booking
(cd ./booking/ ; sh export.sh)
echo documents
(cd ./documents/ ; sh export.sh)
echo inventory
(cd ./inventory/ ; sh export.sh)
echo settings
(cd ./settings/ ; sh export.sh)
echo sale
(cd ./sale/ ; sh export.sh)
echo pos
(cd ./pos/ ; sh export.sh)
echo stats
(cd ./stats/ ; sh export.sh)
echo accounting
(cd ./accounting/ ; sh export.sh)
echo workbench
(cd ./workbench/ ; sh export.sh)