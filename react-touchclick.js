var React = require('react')

module.exports = React.createClass({

  propTypes: {
    up: React.PropTypes.func,
    down: React.PropTypes.func,
    click: React.PropTypes.func,
    nodeName: React.PropTypes.string,
    className: React.PropTypes.string,
    href: React.PropTypes.string
  },

  timer: null,
  clickTimer: null,

  getInitialState: function() {
    return {
      touched: false,
      touchdown: false,
      coords: { x:0, y:0 },
      evObj: {},
      canClick: false
    }
  },

  trigger: function(type, ev) {
    typeof this.props[type] == 'function' && this.props[type].call(this.getDOMNode(), ev)
    if ( type == 'click' )
      this.clearEventBus()
  },

  getCoords: function(e) {
    if ( e.touches && e.touches.length ) {
      var touch = e.touches[0]
      return {
        x: touch.pageX,
        y: touch.pageY
      }
    }
  },

  clearEventBus: function() {
    this.clickTimer && clearTimeout(this.clickTimer)
    this.clickTimer = setTimeout(function() {
      this.isMounted() && this.setState({canClick: true})
    }.bind(this), 400)
  },

  componentDidMount: function() {
    this.clearEventBus()
  },

  onTouchStart: function(e) {
    clearTimeout(this.timer)
    this.setState({
      touched: !( /^(select|input|textarea)$/i.test(e.target.nodeName) ), 
      touchdown: true,
      coords: this.getCoords(e),
      evObj: e
    })
    this.trigger('down', e)
  },

  onTouchMove: function(e) {
    var coords = this.getCoords(e)
    var distance = Math.max( 
      Math.abs(this.state.coords.x - coords.x), 
      Math.abs(this.state.coords.y - coords.y) 
    )
    if ( distance > 6 ) {
      this.state.touchdown && this.trigger('cancel', e)
      this.setState({ touchdown: false })
    }
  },

  onTouchEnd: function(e) {
    if(this.state.touchdown) {
      this.trigger('up', this.state.evObj)
      this.trigger('click', this.state.evObj)

      // optimize form controls too
      if ( !this.state.touched && !/^(radio|checkbox)$/i.test(e.target.type) )
        e.target.focus()

      // allow button submit
      if ( e.target.form && e.target.nodeName == 'BUTTON' && e.target.type == 'submit' )
        e.target.form.submit()
      
    }
    this.timer = setTimeout(function() {
      if ( this.isMounted() )
        this.setState(this.getInitialState())
    }.bind(this), 400)
  },

  onClick: function(e) {
    if ( this.state.touched || !this.state.canClick ) {
      e.preventDefault()
      return
    }
    this.trigger('click', e)
    this.setState(this.getInitialState())
  },

  on: function(type, fn) {
    var d = document
    if ( d.addEventListener )
      return d.addEventListener(type, fn, false)
    else if ( d.attachEvent )
      return d.attachEvent('on'+type, fn)
  },

  off: function(type, fn) {
    var d = document
    if ( d.removeEventListener )
      return d.removeEventListener(type, fn, false)
    else if ( d.detachEvent )
      return d.detachEvent('on'+type, fn)
  },

  onMouseDown: function(e) {
    if( this.state.touched || !this.state.canClick ) {
      e.preventDefault()
      return
    }
    this.trigger('down', e)
    var c = {}
    for( var i in e )
      c[i] = e[i]

    var onMouseUp = function(m) {
      c.type = 'mouseup'
      this.trigger('up', c)
      this.off('dragend', onMouseUp)
      this.off('mouseup', onMouseUp)
      this.off('contextmenu', onMouseUp)
    }.bind(this)

    this.on('dragend', onMouseUp)
    this.on('mouseup', onMouseUp)
    this.on('contextmenu', onMouseUp)

  },

  render: function() {

    var props = {
      className: this.props.className,
      href: this.props.href
    }

    ;['onTouchStart', 'onTouchMove', 'onTouchEnd', 'onClick', 'onMouseDown'].forEach(function(type) {
      props[type] = this[type]
    }.bind(this) )

    return React.DOM[this.props.nodeName || 'div']( props, this.props.children ) 
  }
})