@echo off
REM export to equal public dir
if not exist ..\..\documents mkdir ..\..\documents & copy /Y dist\symbiose\ ..\..\documents\
