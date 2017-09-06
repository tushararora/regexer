'use strict'

/**
 * Manage regex creation, matching
 * and dom manipulation
 * 
 * @class  Regexer
 */
class Regexer {
  /**
   * isObject
   * 
   * @param  {Any}  value
   * 
   * @return {Boolean}
   */
  isObject (value) {
    return Object(value) === value
  }

  /**
   * isString
   * 
   * @param  {Any}  value
   * 
   * @return {Boolean}
   */
  isString (value) {
    return toString.call(value) === '[object String]'
  }

  /**
   * isFunction
   *
   * @param  {Any}  value
   * 
   * @return {Boolean} [description]
   */
  isFunction (value) {
    return toString.call(value) === '[object Function]' || typeof value === 'function'
  }

  /**
   * Populates err inside errorElement
   * 
   * @method  populateError
   * 
   * @param  {Object} errorElement
   * @param  {String} errorMessage
   */
  populateError (errorElement, errorMessage) {
    if (!this.isObject(errorElement)) {
      throw new TypeError(`${errorElement} should be an object`)
    } else if (!this.isString(errorMessage)) {
      throw new TypeError(`${errorMessage} should be a string`)
    }
    const classes = errorElement.classList
    if (classes.contains('hide')) {
      classes.remove('hide')
    }
    this.setInnerHTML(errorElement, errorMessage)
    setTimeout(() => {
      this.clearErrors(errorElement, '')
    }, 3000)
  }

  /**
   * Sets innerHTML of the target element
   * 
   * @method  setInnerHTML
   *
   * 
   * @param {Object} target
   * @param {String} html
   */
  setInnerHTML (target, html) {
    if (!this.isObject(target)) {
      throw new TypeError(`${target} should be an object`)
    } else if (!this.isString(html)) {
      throw new TypeError(`${html} should be a string`)
    }
    target.innerHTML = html
    return target
  }

  /**
   * Creates element from elementName
   * 
   * @method  createElement
   * 
   * @param  {String} elementName
   */
  createElement (elementName) {
    if (!this.isString(elementName)) {
      throw new TypeError(`${elementName} should be a string`)
      return 
    }
    return document.createElement(elementName)
  }

  /**
   * clearResults
   *
   * Clear results from resultsElement
   * 
   * @param  {Object} resultsElement
   */
  clearResults (resultsElement) {
    if (!this.isObject(resultsElement)) {
      return
    }
    this.setInnerHTML(resultsElement, '')
  }

  /**
   * Clears errors from errorElement
   * 
   * @method  clearErrors
   * 
   * @param  {Object} errorElement
   */
  clearErrors (errorElement) {
    if (!this.isObject(errorElement)) {
      throw new TypeError(`${errorElement} should be an object`)
    }
    const classes = errorElement.classList
    if (!classes.contains('hide')) {
      classes.add('hide')
    }
    this.setInnerHTML(errorElement, '')
  }

  /**
   * Create regex from string
   * 
   * @method createRegex
   * 
   * @param  {String} regexStr
   * @return {RegExp}
   */
  createRegex (regexStr) {
    let regex
    try {
      if (regexStr.startsWith('/')) {
        regex = regexStr.split('/')
        regex.shift()

        const flags = regex.pop()
        regex = regex.join('/')

        regex = new RegExp(regex, flags)
      } else {
        regex = new RegExp(regexStr, 'g')
      }
      return regex
    } catch (err) {
      return null
    }
  }

  /**
   * Adds eventListener to the
   * target element
   * 
   * @method  addListener
   * 
   * @param {Object}   target
   * @param {Function} callback
   * @param {Object}   options
   */
  addListener (target, callback, eventName, options = {}) {
    if (!this.isObject(target)) {
      throw new TypeError(`${target} should be an object`)
    } else if (!this.isFunction(callback)) {
      throw new TypeError(`${callback} should be a function`)
    }
    callback = callback.bind(this)
    target.addEventListener(eventName, callback, options)
  }

  /**
   * Handles click event on test button
   * 
   * @method  handleOnClick
   *
   * @param {Object} regexElement
   * @param {Object} textElement
   * @param {Object} errorElement
   * @param {Object} resultsElement
   */
  handleOnClick (regexElement, textElement, errorElement, resultsElement) {
    this.clearResults(resultsElement)
    this.clearErrors(errorElement)

    let regex = regexElement.value
    const text = textElement.value

    if (regex === '') {
      this.populateError(errorElement, 'Please enter a regular expression.')
    } else if (text === '') {
      this.populateError(errorElement, 'Please enter some text to test.')
    } else {
      this.populateResults(regex, text, resultsElement)
    }
  }

  /**
   * Populates results as an html string
   * to the related area
   * 
   * @method populateResults
   *
   * @param  {String} regex
   * @param  {String} text
   * @param {String} resultsElement
   */
  populateResults (regex, text, resultsElement) {
    regex = this.createRegex(regex)

    const results = this.getMatches(regex, text)
    if (results.length === 0 || results[0] === null) {
      this.setInnerHTML(resultsElement, '<p class="result__count__text">There were no matches</p>')
      return
    }
    let html = this.getMatchesCountHTML(results)
    html += this.getResultsHTML(results, text)
    html = html.replace(/\n/g, '<br/>')
    this.setInnerHTML(resultsElement, html)
  }

  /**
   * Returns matches of specified text
   * with the help of given regex
   * 
   * @method  getMatches
   * 
   * @param  {RegExp} regex
   * @param  {String} text
   * 
   * @return {Array}
   */
  getMatches (regex, text) {
    const results = []
    let result
    if (regex.global) {
      while((result = regex.exec(text)) !== null) {
        results.push(result)
      }
    } else {
      results.push(regex.exec(text))
    }
    return results
  }

  /**
   * Returns html for matches count from results array
   * 
   * @method  getMatchesCountHTML
   * 
   * @param  {Array} results
   * 
   * @return {String}
   */
  getMatchesCountHTML (results) {
    if (results.length === 1) {
      return `<p class="result__count__text">There was one match:</p>`
    } else {
      return `<p class="result__count__text">There are ${results.length} matches:</p>`
    }
  }

  /**
   * Returns results html based on matches
   * 
   * @method  getResultsHTML
   * 
   * @param  {Array} results
   * @param  {String} text
   * 
   * @return {String}
   */
  getResultsHTML (results, text) {
    let pointer = 0
    let html = ''

    for (let i = 0 ; i < results.length ; i++) {
    
      const result = results[i]
      const matchString = result.length > 0 ? result[0] : ''

      let resultIndex = result.index

      while(pointer < resultIndex) {
        html += `<span>${text.charAt(pointer)}</span>`
        pointer++
      }

      let counter = pointer + matchString.length

      while(pointer < counter) {
        html += `<span class="highlight__match">${text.charAt(pointer)}</span>`
        pointer++;
      }
    }

    while(pointer < text.length) {
      html += `<span>${text.charAt(pointer)}</span>`
      pointer++
    }

    return html
  }

  /**
   * Initialises the addon by calling addListener on buttonElement
   * 
   * @method  init
   *
   * @param {Object} regexElement
   * @param {Object} textElement
   * @param {Object} errorElement
   * @param {Object} resultsElement
   * @param {Object} buttonElement
   */
  init (regexElement, textElement, errorElement, resultsElement, buttonElement) {
    this.addListener(buttonElement, () => {
      this.handleOnClick(regexElement, textElement, errorElement, resultsElement)
    }, 'click')
  }
}
