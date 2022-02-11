@echo off
REM export to equal public dir
if not exist ..\..\settings mkdir ..\..\settings & copy /Y dist\symbiose\ ..\..\settings\
