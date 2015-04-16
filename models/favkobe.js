"use strict";
module.exports = function(sequelize, DataTypes) {
  var Favkobe = sequelize.define("Favkobe", {
    imgUrl: DataTypes.STRING,
    url: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        //this.belongsTo(models.user)
      }
    }
  });
  return Favkobe;
};