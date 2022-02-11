@echo off
REM export to equal public dir
if not exist ..\..\apps mkdir ..\..\apps & copy /Y dist\symbiose\ ..\..\apps\
