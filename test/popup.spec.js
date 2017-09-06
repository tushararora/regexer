'use strict'

describe('class Regexer', function () {
  let sandbox
  let regexer
  let clock

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    clock = sandbox.useFakeTimers()
    regexer = new Regexer()
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('testing populateError method', function () {
    it('should throw error when called with errorElement as null', function () {
      expect(function () {
        regexer.populateError(null, '')
      }).to.throw(TypeError)
    })

    it('should throw error when called with errorMessage as type other than string', function () {
      expect(function () {
        regexer.populateError({}, null)
      }).to.throw(TypeError)
    })

    it('should remove \'hide\' from classList if present', function () {
      const errorElement = document.createElement('div')
      sandbox.stub(regexer, 'setInnerHTML')
      sandbox.stub(regexer, 'clearErrors')
      errorElement.classList.add('hide')

      regexer.populateError(errorElement, 'Error')

      expect(errorElement.classList.contains('hide')).to.equal(false)
    })

    it('should call setInnerHTMl', function () {
      const spy = sandbox.spy(regexer, 'setInnerHTML')
      const errorElement = document.createElement('div')
      sandbox.stub(regexer, 'clearErrors')

      regexer.populateError(errorElement, 'Error')

      expect(spy.called).to.equal(true)
    })

    it('should call clearErrors after 3000ms', function () {
      const spy = sandbox.spy(regexer, 'clearErrors')
      const errorElement = document.createElement('div')
      sandbox.stub(regexer, 'setInnerHTML')

      regexer.populateError(errorElement, 'Error')
      clock.tick(3000)

      expect(spy.called).to.equal(true)
    })
  })

  describe('testing setInnerHTML method', function () {
    it('should throw error if target is not an object', function () {
      expect(function () {
        regexer.setInnerHTML(null, '<p></p>')
      }).to.throw(TypeError)
    })

    it('should throw error if html is not a string', function () {
      expect(function () {
        regexer.setInnerHTML({}, null)
      }).to.throw(TypeError)
    })

    it('should set target.innerHTML to html and return target', function () {
      const target = {
        innerHTML: ''
      }
      const html = '<p></p>'
      const returnValue = regexer.setInnerHTML(target, html)
      expect(target.innerHTML).to.equal(html)
    })
  })
  
  describe('testing createElement method', function () {
    it('should throw error when called with elementName type other than string', function () {
      expect(function () {
        regexer.createElement(null)
      }).to.throw(TypeError)
    })
  })

  describe('testing clearErrors method', function () {
    it('should throw error when called with errorElement type other than object', function () {
      expect(function () {
        regexer.clearErrors(null)
      }).to.throw(TypeError)
    })

    it('should add \'hide\' to classList if not present', function () {
      const errorElement = document.createElement('div')
      regexer.clearErrors(errorElement)
      expect(errorElement.classList.contains('hide')).to.equal(true)
    })

    it('should call setInnerHTML', function () {
      const errorElement = document.createElement('div')
      const spy = sandbox.spy(regexer, 'setInnerHTML')
      regexer.clearErrors(errorElement)
      expect(spy.calledWith(errorElement, '')).to.equal(true)
    })
  })

  describe('testing createRegex method', function () {
    it('should return value of type RegExp when called with regexStr as a simple string', function () {
      expect(regexer.createRegex('test')).to.match(new RegExp('test'))
    })

    it('should return value of type RegExp when called with regexStr as a regex string', function () {
      expect(regexer.createRegex('/test/g')).to.match(new RegExp('test', 'g'))
    })
  })

  describe('testing addListener method', function () {
    it('should throw error when called with target other than object', function () {
      expect(function () {
        regexer.addListener(null, function() {}, 'click')
      }).to.throw(TypeError)
    })

    it('should throw error when called with callback other than function', function () {
      expect(function () {
        regexer.addListener({}, null, 'click')
      }).to.throw(TypeError)
    })

    it('should call addEventListener when arguments are ok', function () {
      const target = document.createElement('div')
      const spy = sandbox.spy(target, 'addEventListener')
      const callback = function () {}
      const eventName = 'click'

      regexer.addListener(target, callback, eventName)

      expect(spy.calledOnce).to.eql(true)
    })
  })

  describe('testing handleOnClick method', function () {
    let regexElement
    let textElement
    let errorElement
    let resultsElement

    beforeEach(function () {
      regexElement = regexer.createElement('div')
      textElement = regexer.createElement('div')
      errorElement = regexer.createElement('div')
      resultsElement = regexer.createElement('div')
    })

    it('should call clearResults and clearErrors with respective elements', function () {
      const clearErrorsSpy = sandbox.spy(regexer, 'clearErrors')
      const clearResults = sandbox.spy(regexer, 'clearResults')
      sandbox.stub(regexer, 'populateError')
      sandbox.stub(regexer, 'populateResults')

      regexer.handleOnClick(regexElement, textElement, errorElement, resultsElement)

      expect(clearErrorsSpy.calledWith(errorElement)).to.eql(true)
      expect(clearResults.calledWith(resultsElement)).to.eql(true)
    })

    describe('testing populateError and populateResults called from handleOnClick', function () {
      let mock
      before(function () {
        sandbox.stub(regexer, 'clearErrors')
        sandbox.stub(regexer, 'clearResults')
      })

      it('should call populateError when regexElement.value is empty', function () {
        const mock = sandbox.mock(regexer)
        mock.expects('populateError').once().withArgs(errorElement, 'Please enter a regular expression.')
        regexElement.value = ''
        textElement.value = 'Test regex'

        regexer.handleOnClick(regexElement, textElement, errorElement, resultsElement)

        mock.verify()
      })

      it('should call populateError when textElement.value is empty', function () {
        const mock = sandbox.mock(regexer)
        mock.expects('populateError').once().withArgs(errorElement, 'Please enter some text to test.')
        regexElement.value = '/test/g'
        textElement.value = ''

        regexer.handleOnClick(regexElement, textElement, errorElement, resultsElement)

        mock.verify()
      })

      it('should call populateResults when arguments are ok', function () {
        regexElement.value = '/test/g'
        textElement.value = 'test'
        const mock = sandbox.mock(regexer)
        mock.expects('populateResults').once().withArgs(regexElement.value, textElement.value)

        regexer.handleOnClick(regexElement, textElement, errorElement, resultsElement)

        mock.verify()
      })
    })

    describe('testing populateResults method', function () {
      let resultsElement

      beforeEach(function () {
        resultsElement = document.createElement('div')
      })

      it('should call setInnerHTML if no results are found', function () {
        const regex = '/hello/g'
        const text = 'This is a test'
        const spy = sandbox.spy(regexer, 'setInnerHTML')
         
        regexer.populateResults(regex, text, resultsElement)

        expect(spy.calledWith(resultsElement, '<p class="result__count__text">There were no matches</p>')).to.eql(true)
      })

      it('should replace new line to html break element if it is present', function () {
        const regex = '/hello/g'
        const text = 'This is a hello<br/>'
        const spy = sandbox.spy(regexer, 'setInnerHTML')
        sandbox.stub(regexer, 'getMatchesCountHTML').returns('Test \n')
        sandbox.stub(regexer, 'getResultsHTML').returns('')

        regexer.populateResults(regex, text, resultsElement)

        expect(spy.calledWith(resultsElement, 'Test <br/>')).to.eql(true)
      })

      it('should call setInnerHTML when results are found', function () {
        const regex = '/hello/g'
        const text = 'This is a test'
        const spy = sandbox.spy(regexer, 'setInnerHTML')

        regexer.populateResults(regex, text, resultsElement)

        expect(spy.calledOnce).to.eql(true)
      })
    })
  })

  describe('testing getMatches method', function () {
    it('should return empty array if no match is found', function () {
      expect(regexer.getMatches(/hello/g, 'This is a test string')).to.deep.equal([])
    })

    it('should return one result if global flag is not specified', function () {
      const matches = regexer.getMatches(/test/, 'This is a test string. This is another test string.')

      expect(matches[0][0]).to.equal('test')
      expect(matches[0].index).to.eql(10)
    })

    it('should return multiple matches if global flag is specified', function () {
      const matches = regexer.getMatches(/test/g, 'This is a test string. This is another test string.')

      expect(matches[0].index).to.eql(10)
      expect(matches[1].index).to.eql(39)
    })
  })

  describe('testing getMatchesCountHTML method', function () {
    it('should return singular verb message for single result', function () {
      const results = [{}]
      expect(regexer.getMatchesCountHTML(results)).to.eql(`<p class="result__count__text">There was one match:</p>`)
    })

    it('should return plural verb message for single result', function () {
      const results = [{}, {}]
      expect(regexer.getMatchesCountHTML(results)).to.eql(`<p class="result__count__text">There are ${results.length} matches:</p>`)
    })
  })

  describe('testing getResultsHTML method', function () {
    it('should return html string when called', function () {
      const text = 'Yo! test'
      const results = regexer.getMatches(/test/g, text)
      expect(regexer.getResultsHTML(results, text)).to.eql('<span>Y</span><span>o</span><span>!</span><span> </span><span class="highlight__match">t</span><span class="highlight__match">e</span><span class="highlight__match">s</span><span class="highlight__match">t</span>')
    })
  })

  describe('testing init method', function () {
    let regexElement
    let textElement
    let errorElement
    let resultsElement
    let buttonElement

    before(function () {
      regexElement = regexer.createElement('div')
      textElement = regexer.createElement('div')
      errorElement = regexer.createElement('div')
      resultsElement = regexer.createElement('div')
      buttonElement = regexer.createElement('button')
    })

    it('should initialize the addon by calling addListener', function () {
      const mock = sandbox.mock(regexer)
      sandbox.stub(regexer, 'handleOnClick')
      mock.expects('addListener').once()

      regexer.init(regexElement, textElement, errorElement, resultsElement, buttonElement)

      mock.verify()
    })
  })
})