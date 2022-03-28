@echo off
REM export to equal public dir
if exist ..\..\pos rmdir /Q /S ..\..\pos & mkdir ..\..\pos & copy /Y dist\pos\* ..\..\pos\
