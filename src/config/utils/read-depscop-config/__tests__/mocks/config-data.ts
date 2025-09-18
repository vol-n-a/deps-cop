export const mockConfigData = {
  stringValue: "test",
  numberValue: 123,
  booleanValue: true,
  nullValue: null,
  packages: ["react", "vue", "angular"],
  versions: ["1.0.0", "2.0.0", "3.0.0"],
  rules: {
    recent: {
      dependency: ["-1.-2.-3", "Reason"],
    },
    forbidden: {
      dependency: ["1.2.3", "Reason"],
    },
  },
  unicode: "测试 🚀 ñáéíóú",
  emoji: "🎉 🎊 🎈",
  specialChars: "àáâãäåæçèéêë",
};
