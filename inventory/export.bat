@echo off
REM export to equal public dir
if not exist ..\..\inventory mkdir ..\..\inventory & copy /Y dist\symbiose\ ..\..\inventory\
