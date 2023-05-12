1) npm i (after clone or if new dependency is added)

2) ionic serve -l (to run app on browser)

3) Follow below steps to run app on device/simulator:
- ionic build
- npx cap add android/ios (do this only first time)
- npx cap sync (do this next time onwards)
- npx cap open android/ios
- run app from android studio/xcode (selecting simulator/device)

4) for copying respurces (icon & splash). 
Prerequisites: 
 - capacitor-resources installed globally. 
 - icon.png (1024x1024 px), splash.png (2732x2732 px) in 'resources' folder
- capacitor-resources  

==================================
for web deployment do following steps
- if ionic cli not available do only first time - npm install -g @ionic/cli
- switch and/or pull required branch
- npm i
- npm run build 
- use 'www' directory contents for serving build output statically for web deployment





****************************Updating project from angular 11 to 12(@12.0.4) ***********************

Step 1. Uninstall the @angular/cli (npm uninstall -g @angular/cli@12.0.4)

Step 2. Install node version to 14+

Step 3. delete all node modules from the root directory

Step 4. Clean npm cache (npm cache clean --force)

Step 5. Install @angular/cli (npm install -g @angular/cli@12.0.4)

Step 6. do 'ng version'. It should show angular 12.0.4 

Step 7. Note: Please set the "dependencies": {} and devDependencies: {} in your package.json. This is very important

Step 8. Now first install dev dependancies using below command
        npm install @angular-devkit/build-angular @angular/cli @angular/compiler @angular/compiler-cli @angular/language-service @capacitor/cli @ionic/angular-toolkit @ionic/lab @types/jasmine @types/jasminewd2 @types/node codelyzer cordova-res jasmine-core jasmine-spec-reporter karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine postcss prettier protractor ts-node tslint typescript --save-dev
Step 9. Now install the normal module dependancies
        npm install @angular/common @angular/core @angular/forms @angular/platform-browser @angular/platform-browser-dynamic @angular/router @capacitor/android @capacitor/core @capacitor/ios @ionic-native/core @ionic-native/in-app-browser @ionic-native/splash-screen @ionic-native/status-bar @ionic/angular @ionic/pwa-elements @ionic/storage-angular @ngx-translate/core @ngx-translate/http-loader cordova-plugin-inappbrowser ionic-tooltips moment moment-timezone rxjs tslib zone.js

Note****:   Step 7 is very important below before doing step 8 & 9





