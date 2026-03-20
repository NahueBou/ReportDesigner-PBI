@echo off
set NODE_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Microsoft\VisualStudio\NodeJs
set PATH=%NODE_PATH%;%PATH%
cd /d "C:\Users\nahue\OneDrive\Escritorio\ReportDesigner-PBI\frontend"
"%NODE_PATH%\node.exe" "%NODE_PATH%\node_modules\npm\bin\npm-cli.js" run start
