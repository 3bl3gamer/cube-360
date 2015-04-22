var control = {};
control.add = function(opts) {
	var singleDown = opts.singleDown;
	var singleMove = opts.singleMove;
	var singleUp = opts.singleUp;
	
	var doubleDown = opts.doubleDown;
	var doubleMove = opts.doubleMove;
	var doubleUp = opts.doubleUp;
	
	var wheelRot = opts.wheelRot;
	
	var startElem = opts.startElem;
	var stopElem = opts.stopElem;
	
	
	function grab(e) {
		var box = startElem.getBoundingClientRect();
		singleDown(e.clientX-box.left, e.clientY-box.top, false) && e.preventDefault();
	}
	function move(e) {
		var box = startElem.getBoundingClientRect();
		singleMove(e.clientX-box.left, e.clientY-box.top) && e.preventDefault();
	}
	function drop(e) {
		singleUp(false) && e.preventDefault();
	}
	
	
	var touch_numb = 0;
	var last_touch_x = NaN;
	var last_touch_y = NaN;
	
	function touchStart(e) {
		if (e.targetTouches.length > 2) return; //TODO: get by identifier. Everywhere
		
		var box = startElem.getBoundingClientRect();
		var prevent = false;
		
		var t0 = e.targetTouches[0];
		var t1 = e.targetTouches[1];
		
		if (e.targetTouches.length == 1) {
			prevent = singleDown(t0.clientX-box.left, t0.clientY-box.top, false);
		} else {
			if (touch_numb == 0) console.warn("Received touchstart for TWO new touches!");
			prevent = singleUp(true);
			prevent += doubleDown(
				t0.clientX-box.left, t0.clientY-box.top,
				t1.clientX-box.left, t1.clientY-box.top
			);
		}
		
		if (prevent) e.preventDefault();
		touch_numb = e.targetTouches.length;
		last_touch_x = t0.clientX-box.left;
		last_touch_y = t0.clientY-box.top;
	}
	
	function touchMove(e) {
		if (e.targetTouches.length > 2) return;
		if (e.targetTouches.length != touch_numb) return; //тут что-то не так
		
		var box = startElem.getBoundingClientRect();
		
		var t0 = e.targetTouches[0];
		var t1 = e.targetTouches[1];
		
		if (e.targetTouches.length == 1) {
			singleMove(t0.clientX-box.left, t0.clientY-box.top) && e.preventDefault();
		} else {
			//мобильная Опера 12.04 передёт тачи сюда в обратном порядке
			if (t0.identifier > t1.identifier) {var t=t0; t0=t1; t1=t;}
			doubleMove(
				t0.clientX-box.left, t0.clientY-box.top,
				t1.clientX-box.left, t1.clientY-box.top
			) && e.preventDefault();
		}
		
		last_touch_x = t0.clientX-box.left;
		last_touch_y = t0.clientY-box.top;
	}
	
	function touchEnd(e) {
		if (e.targetTouches.length > 1) return;
		
		if (e.targetTouches.length == 0) {
			if (touch_numb == 2) { // если подняли оба пальца сразу
				console.warn("TWO touches ended simultaneously!");
				(doubleUp() + singleDown(last_touch_x, last_touch_y, true)) && e.preventDefault();
			}
			singleUp(false) && e.preventDefault();
		} else {
			var box = startElem.getBoundingClientRect();
			var t = e.targetTouches[0];
			(doubleUp() + singleDown(t.clientX-box.left, t.clientY-box.top, true)) && e.preventDefault();
		}
		
		touch_numb = e.targetTouches.length;
	}
	
	startElem.addEventListener('mousedown', grab, true);
	startElem.addEventListener('mousemove', move, true);
	stopElem.addEventListener('mouseup', drop, true);
	startElem.addEventListener('touchstart', touchStart, true);
	startElem.addEventListener('touchmove', touchMove, true);
	stopElem.addEventListener('touchend', touchEnd, true);
	
	if (wheelRot) {
		startElem.addEventListener('mousewheel',     function(e) {
			wheelRot(e.wheelDelta/120, e.wheelDeltaX/120, e.wheelDeltaY/120) && e.preventDefault();
		}, true);
		startElem.addEventListener('DOMMouseScroll', function(e) {
			wheelRot(-e.detail, e.axis==1 ? -e.detail : 0, e.axis==2 ? -e.detail : 0) && e.preventDefault();
		}, true);
	}
}
