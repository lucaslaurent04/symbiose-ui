@echo off
REM export to equal public dir
if exist ..\..\sale rmdir /Q /S ..\..\sale & mkdir ..\..\sale & copy /Y dist\sale\* ..\..\sale\
