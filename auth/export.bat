@echo off
REM export to equal public dir
if not exist ..\..\auth mkdir ..\..\auth & copy /Y dist\symbiose\ ..\..\auth\
