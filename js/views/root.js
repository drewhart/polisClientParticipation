/*
 * Copyright 2012-present, Polis Technology Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights for non-commercial use can be found in the PATENTS file
 * in the same directory.
 */

var LayoutView = require("../layout-view");
var rootTemplate = require("../tmpl/root");

var RootView = LayoutView.extend({
  name: "root",
  template: rootTemplate
});
var instance;
RootView.getInstance = function(target) {
  if (!instance) {
    instance = new RootView();
    instance.appendTo(target || document.body);
  }
  return instance;
};

module.exports = RootView;
