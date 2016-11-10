module.exports = function prepare(options, callback) {
  const injectOptions = {
    mobile: (options.target === 'mobile'),
  };
  options.project.build().then((buildMsg) => {
    if (!buildMsg.error) {
      options.project.inject(injectOptions).then((injectMsg) => {
        if (!injectMsg.error) {
          options.project.constants(options.target).then((constantsMsg) => {
            if (!constantsMsg.error) {
              let message = `✅\t${buildMsg.message}\n`;
              message += `✅\t${injectMsg.message}\n`;
              message += `✅\t${constantsMsg.message}\n`;
              callback({ error: false, message });
            } else {
              callback({ error: true, message: constantsMsg.message });
            }
          });
        } else {
          callback({ error: true, message: injectMsg.message });
        }
      });
    } else {
      callback({ error: true, message: buildMsg.message });
    }
  });
};
