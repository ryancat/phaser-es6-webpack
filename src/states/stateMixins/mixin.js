import _ from 'lodash'

const mixin = {

  /**
   * Load state mixin to current state context
   * @param  {String} stateMixin - The state mixin to be loaded
   * @return {Boolean} - True if the mixin is loaded successfully
   */
  load: (context, stateMixin = {}) => {
    if (!context) {
      return false
    }

    let key

    for (key in stateMixin) {
      if (stateMixin.hasOwnProperty(key)) {
        let toMixinItem = stateMixin[key]
        if (_.isUndefined(context[key])) {
          context[key] = _.isFunction(toMixinItem) ? toMixinItem.bind(context) : toMixinItem
        }
      }
    }

    return true
  }

}

export default mixin
