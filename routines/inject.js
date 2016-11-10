module.exports = function inject(options, callback) {
  // create a options to bower action
  const injectOptions = {
    mobile: (options.target === 'mobile'),
  };
  // execute bower action
  options.project.inject(injectOptions).then((value) => {
    callback(value);
  });
};
