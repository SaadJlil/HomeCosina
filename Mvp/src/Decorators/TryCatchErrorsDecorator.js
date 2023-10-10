

class ErrorCatcher {
  static TryCatchErrorsDecoratorAsync(target, propertyKey, descriptor) {
    const fn = descriptor.value;

    return {
      async value(...arg) {
       try {
          return await fn.call(this, ...arg);
        } catch (error) {
          throw error;
        }
      }
    };

  }
  static TryCatchErrorsDecorator(target, propertyKey, descriptor) {
    const fn = descriptor.value;

    return {
      value(...arg) {
       try {
          return fn.call(this, ...arg);
        } catch (error) {
          throw error
        }
      }
    };
  }
}


/*
    return {
      value(args) {
        try {
          return fn.call(this, args);
        } catch (error) {
          console.log('zbi')
          //next(error);
        }
      }
    };
*/


module.exports = ErrorCatcher;



