import ComponentView from 'core/js/views/componentView';
import { isNaN, isNull } from 'underscore';

class CountersView extends ComponentView {

  postRender() {
    this.$('.counters__widget').imageready(() => {
      this.setReadyStatus();
    });

    this.$('.counters__widget').on('onscreen.animate', this.checkIfOnScreen.bind(this));

    if (this.model.get('_setCompletionOn') !== 'inview') return;
    this.setupInviewCompletion('.component__widget');

  }

  animateItems () {
    const speed = this.model.get('_transitionSpeed');

    for (const item of this.model.getChildren()) {

      const _countEnd = item.get('_countEnd');
      const _countStart = item.get('_countStart');

      const _startInteger = parseInt(_countStart, 10); //take integer part from start and end
      const _endInteger = parseInt(_countEnd, 10); 

      const decimalStartPartString = _countStart.toString().split('.')[1]; //same for decimal
      const decimalEndPartString = _countEnd.toString().split('.')[1];

      var _startDecimal = parseInt(decimalStartPartString, 10); //we will set it bey defualt to 0 if there is _EndDecimal
      const _endDecimal = parseInt(decimalEndPartString, 10); 
     
      this.animateNumber(_startInteger, _endInteger, speed, item, (value) => {
        item.set('_countInteger', value);
        this.formatNumber(item);
      });

      if(_endDecimal && isNaN(_startDecimal)) //if _endDecimal is set but start decimal is not
        _startDecimal = 0;

      if (_endDecimal) { //only start if there is _endDecimal
        this.animateNumber(_startDecimal, _endDecimal, speed, item, (value) => {
          item.set('_countDecimal', value);
          this.formatNumber(item);
        });
      }
      else item.set('_countDecimal', null);   
    }
  }

  /**
   * Call setReadyStatus when animation is finished
   */


  formatNumber(item) {
    const countInteger = item.get('_countInteger');
    const countDecimal = item.get('_countDecimal');

    var integerPart = countInteger.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); //add spaces for better look

    let result;

    if (countDecimal)
      result = integerPart + '.' + countDecimal.toString();
    else
      result = integerPart;

    item.set('_delimitedString', result);  
  }

  animateNumber(start, end, duration, item, callback) {
    const startTime = performance.now();
    const totalChange = end - start;
    
    function update() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentValue = start + totalChange * progress;

        callback(Math.round(currentValue));

        if (progress < 1) {
          window.requestAnimationFrame(update); 
        }
        else {
          item.set('_completed', true);
        }
    }
    window.requestAnimationFrame(update);
  }

  checkIfOnScreen({ currentTarget }, { percentInviewVertical }) {
    if (percentInviewVertical < this.model.get('_percentInviewVertical')) return;
    $(currentTarget).off('onscreen.animate');
    this.animateItems();
  }

  remove() {
    this.$('.counters__widget').off('onscreen.animate');
    super.remove();
  }
}

CountersView.template = 'counters.jsx';

export default CountersView;

