@echo off
REM export to equal public dir
if not exist ..\..\booking mkdir ..\..\booking & copy /Y dist\symbiose\ ..\..\booking\
