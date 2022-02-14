@echo off
REM export to equal public dir
if exist ..\..\settings rmdir /Q /S ..\..\settings & mkdir ..\..\settings & copy /Y dist\symbiose\* ..\..\settings\
