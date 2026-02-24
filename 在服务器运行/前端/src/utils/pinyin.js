import pinyin from 'pinyin'

/**
 * 中文转拼音（获取首字母小写）
 * @param {string} chinese - 中文字符串
 * @returns {string} - 拼音字符串（小写，无空格）
 */
export function chineseToPinyin(chinese) {
  if (!chinese) return ''
  
  // 转换为拼音数组，style: 0 表示普通风格（不带音调）
  const pinyinArray = pinyin(chinese, {
    style: pinyin.STYLE_NORMAL,  // 普通风格，不带音调
    heteronym: false,             // 不启用多音字
  })
  
  // 将数组平铺成字符串，去掉空格
  return pinyinArray.flat().join('').toLowerCase()
}

/**
 * 生成别名（只取每个汉字的首字母）
 * @param {string} chinese - 中文字符串
 * @returns {string} - 首字母拼音
 */
export function chineseToFirstLetter(chinese) {
  if (!chinese) return ''
  
  const pinyinArray = pinyin(chinese, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false,
  })
  
  // 只取每个字的首字母
  return pinyinArray.map(item => item[0][0]).join('').toLowerCase()
}