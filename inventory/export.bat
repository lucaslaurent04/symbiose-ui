@echo off
REM export to equal public dir
if exist ..\..\inventory rmdir /Q /S ..\..\inventory & mkdir ..\..\inventory & copy /Y dist\inventory\* ..\..\inventory\
