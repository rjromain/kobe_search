"use strict";
module.exports = function(sequelize, DataTypes) {
  var Like = sequelize.define("Like", {
    likeUrl: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User)
      }
    }
  });
  return Like;
};