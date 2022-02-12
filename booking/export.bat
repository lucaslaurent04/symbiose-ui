@echo off
REM export to equal public dir
if exist ..\..\booking rmdir /Q /S ..\..\booking & mkdir ..\..\booking & copy /Y dist\booking\* ..\..\booking\
