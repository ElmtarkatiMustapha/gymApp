@echo off
echo Building React Frontend...
cd frontend
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

echo Copying index.html to Laravel views...
if not exist "backend\resources\views" mkdir "backend\resources\views"
copy /Y frontend\dist\index.html backend\resources\views\frontend.blade.php

echo Copying all other assets to Laravel public directory...
xcopy /E /Y /C /I frontend\dist\* backend\public\
:: Delete the index.html from public to prevent conflicts with Laravel's index.php
if exist backend\public\index.html del /F /Q backend\public\index.html

echo ==============================================
echo Done! The frontend is now combined with the backend.
echo You can run your backend server normally:
echo cd backend 
echo php artisan serve
echo ==============================================
