import _ from 'lodash'

const DEFAULT_LAYER_WIDTH = 400
const DEFAULT_LAYER_HEIGHT = 700

export default class GameLayer {

  /**
   * @param  {Object} prop - Properties for game layer
   *   {HTMLElement} container - Container for the layer to live in
   *   {String} type - Layer type
   *   {Object} context - Context of function pass in.
   *   {Number} [width] - Width of layer. Default to screen width.
   *   {Number} [height] - height of layer. Default to screen height.
   *   {Array} [contents] - Array of content element. Default to [].
   *   {String} [classname] - classname added to layer.
   *   {String} [id] - id added to layer
   *   {Object} [style] - style object to use on layer.
   *   {HTMLElement} container - container for the layer to live in.
   */
  constructor (prop = {}) {
    let layerType = prop.type || 'canvas',
        layer = document.createElement(layerType),
        container = prop.container,
        context = prop.context,
        width = prop.width || context ? context.game.world.width : DEFAULT_LAYER_WIDTH,
        height = prop.height || context ? context.game.world.height : DEFAULT_LAYER_HEIGHT,
        contents = prop.contents || [],
        updateLayerFn = _.isFunction(prop.update) ? prop.update.bind(prop.context) : _.noop

    if (prop.classname) {
      layer.classList.add(prop.classname)
    }

    if (prop.layerId) {
      // Layer attributes
      layer.id = prop.layerId
    }
    
    // different logics for layer types
    switch(layerType) {
      case 'canvas':
        let layerCtx = layer.getContext('2d') 
        // Styles
        layer.width = width
        layer.height = height
        _.extend(layerCtx, prop.style)

      case 'div':
        let layerStyle = layer.style
        // Styles
        layerStyle.width = width + 'px'
        layerStyle.height = height + 'px'
        _.extend(layerStyle, prop.style)
    }

    // Contents
    contents.forEach((content) => {
      layer.appendChild(content)
    })

    // Add layer to document
    if (container) {
      container.appendChild(layer)  
    } else {
      console.warn('No container for layer', layer)
    }

    // Make sure the layer is hidden if set to
    layer.hidden = !!prop.isHidden
    this.displayStyle = window.getComputedStyle(layer).display
    layer.style.display = layer.hidden ? 'none' : this.displayStyle

    // Attach to class instances
    _.extend(this, {
      element: layer,
      context: layerType === 'canvas' ? layer.getContext('2d') : null,
      update: updateLayerFn
    })
  }

  show () {
    this.element.hidden = false
    this.element.style.display = this.displayStyle
  }

  hide () {
    this.element.hidden = true
    this.element.style.display = 'none'
  }

}