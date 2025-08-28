@echo off
echo Starting Frontend with Hot-Reload...
echo.

REM 
echo Stopping existing containers...
docker-compose stop frontend

REM 
echo Removing existing frontend container...
docker-compose rm -f frontend

REM 
echo Rebuilding frontend image...
docker-compose build frontend

REM 
echo Starting frontend with hot-reload...
docker-compose up frontend

pause
