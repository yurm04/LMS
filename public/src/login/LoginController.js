// Controller function for Login
function LoginController() {
  this.message = 'hello';
}

// Add LoginController to LMSApp module
angular.module('LMSApp').controller('LoginController', LoginController);