@echo off
REM export to equal public dir
if exist ..\..\documents rmdir /Q /S ..\..\documents & mkdir ..\..\documents & copy /Y dist\documents\* ..\..\documents\
