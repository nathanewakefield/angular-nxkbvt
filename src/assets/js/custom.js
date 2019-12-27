/* JS for preset "Header Baldur" */
$(function() {
	init();
});

// Make :active pseudo classes work on iOS
document.addEventListener("touchstart", function() {}, false);

var init = function() {
	// menu-wrapper-spacer height calc for non-jumpy sticky  
	var menuSpacer = function() {
		$('.menu-wrapper-spacer').each(function() {
			if (document.body.classList.contains('edit') || document.body.classList.contains('preview')) {
				return;
			}
			var $mwh = $('.menu-wrapper', this).outerHeight();
			$(this).css('height', $mwh);
		});

	}

	menuSpacer();

	$(window).resize(function() {
		menuSpacer();
	});

	var isOnePager = true;

	// Commonly used elements
	var $header = $('.header');
	var $menu = $('.header .ed-menu');
	var $menuLinks = $('a', $menu);
	var $menuTrigger = $('.menu-trigger');
	var $backToTop = $('.back-to-top');
	var $menuWrapper = $('.menu-wrapper');

	toggleClassOnClick($menu, $menuTrigger, 'open');
	clickToTop($backToTop);
	activateSticky($menuWrapper, 'sticky', function(params) {
		params.offset = $header.outerHeight() - $menuWrapper.outerHeight() - 2;
	});

	// Activate functions that are needed for one-pagers
	if (isOnePager) {
		activateSmoothScroll($menuLinks.add($('.scroll a')));
		addClassOnVisibleLinkTargets($menuLinks, 'active', 2 / 3);
	}
};

/**
 * Toggles class on a target when a trigger is clicked
 * 
 * @param {jQuery} The target to apply the CSS class to
 * @param {jQuery} The Trigger
 * @param {string} CSS Class to toggle on the target
 */
var toggleClassOnClick = function($target, $trigger, cssClass) {
	// Reset in case class "open" was saved accidentally
	$target.removeClass(cssClass);
	$trigger.removeClass(cssClass);

	// Click on trigger toggles class "open"
	$trigger.off('.toggle').on('click.toggle', function() {
		$(this).toggleClass(cssClass);
		$target.toggleClass(cssClass);
	});

	// Close target when link inside is clicked
	$target.find('a').click(function() {
		$target.removeClass(cssClass);
		$trigger.removeClass(cssClass);
	});
};

/**
 * Scroll to the top of the page when element is clicked
 * 
 * @param {jQuery} The element which triggers scroll to top
 */
var clickToTop = function($trigger) {
	$trigger.removeClass('show');

	$trigger.click(function(e) {
		e.preventDefault();
		viewport.scrollTo(0, 'top', 500, 0);
	});

	// Show back to top only below the fold
	viewport.observe('scroll', function() {
		if (viewport.getScrollTop() > viewport.getHeight()) {
			$trigger.addClass('show');
		} else {
			$trigger.removeClass('show');
		}
	});
}

/**
 * Smooth scroll to link targets
 * 
 * @param {jQuery} The links
 * @param {jQuery} Offset to subtract from the scroll target position (e.g. for fixed positioned elements like a menu)
 */
var activateSmoothScroll = function($scrollLinks, scrollOffset) {
	if (typeof scrollOffset === 'undefined') {
		scrollOffset = 0;
	}

	var determineTarget = function($trigger, hash) {
		if (hash == '#!next') {
			return $trigger.parents('.ed-element').last().next();
		}

		return $(hash);
	}

	$scrollLinks.click(function(e) {
		var $target = determineTarget($(this), this.hash);
		if (!$target.length) return;

		e.preventDefault();
		viewport.scrollTo($target, 'top', 500, -scrollOffset);
	});
};

/**
 * Adds a class to an element when not currently visible
 * 
 * @param {jQuery} Element
 * @param {string} CSS class to be applied to the element when it's outside the viewport
 * @param {string} Can be set to 'top', 'bottom' or 'full'
 * @param {int|function} Custom offset after which cssClass is applied. If not set, default to $element's position
 */
var activateSticky = function($element, cssClass, offset, mode) {
	var self = this;

	self.offset = 0;
	self.height = 0;

	$element.removeClass(cssClass);

	var updateOffset = function() {
		if (typeof offset === 'undefined') {
			self.offset = $element.offset().top;
			self.height = $element.outerHeight();
		} else if (typeof offset === 'function') {
			offset(self);
		} else {
			self.offset = offset;
			self.height = 0;
		}
	}
	viewport.observe('resize', updateOffset);
	viewport.observe('animation.end', updateOffset);
	updateOffset();

	var isVisible = function(mode) {
		return (
			(typeof mode === 'undefined' && (self.offset + self.height) > viewport.getScrollTop()) ||
			((mode === true || mode == 'full') && self.offset > viewport.getScrollTop()) ||
			(mode == 'top' && self.offset > viewport.getScrollTop()) ||
			(mode == 'bottom' && (self.offset + self.height) > viewport.getScrollTop())
		);
	};

	viewport.observe('scroll', function() {
		if (!isVisible(mode)) {
			$element.addClass(cssClass);
		} else {
			$element.removeClass(cssClass);
		}
	});
};

/**
 * Adds a class to links whose target is currently inside the viewport
 * 
 * @param {jQuery} Link(s) to be observed
 * @param {string} CSS Class to be applied
 * @param {float} Ratio by which the target should be within the viewport
 */
var addClassOnVisibleLinkTargets = function($links, cssClass, sectionViewportRatio) {
	if (typeof sectionViewportRatio === 'undefined') {
		sectionViewportRatio = 1 / 2;
	}

	var menuTargets = [];
	var activeLink = $links.filter('.active');

	var links = $links.filter(function() {
		var $target = $(this.hash);
		if (!$target.length) {
			return false;
		}

		// Cache offset position to improve performance (update on resize)		
		var updateOffset = function() {
			$target.data('offset', $target.offset().top);
		};

		viewport.observe('resize', updateOffset);
		viewport.observe('animation.end', updateOffset);
		updateOffset();

		menuTargets.push($target);
		return true;
	});

	// No hash links found, so don't handle it at all
	if (!links.length) {
		return;
	}

	var checkVisibility = function() {
		$links.removeClass('active');

		// Check section position reversely
		for (var i = menuTargets.length - 1; i >= 0; i--) {
			var desiredScrollPosition = menuTargets[i].data('offset') - viewport.getHeight() * (1 - sectionViewportRatio);
			if (viewport.getScrollTop() >= desiredScrollPosition) {
				links.eq(i).addClass(cssClass);
				return;
			}
		}

		// Fallback to originally active item
		activeLink.addClass(cssClass);
	};

	viewport.observe('scroll', checkVisibility);
	checkVisibility();
};

/* End JS for preset "Header Baldur" */

/* JS for preset "Counter" */
$(function() {
	EasingFunctions = {
		// no easing, no acceleration
		linear: function(t) {
			return t
		},
		// accelerating from zero velocity
		easeInQuad: function(t) {
			return t * t
		},
		// decelerating to zero velocity
		easeOutQuad: function(t) {
			return t * (2 - t)
		},
		// acceleration until halfway, then deceleration
		easeInOutQuad: function(t) {
			return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
		},
		// accelerating from zero velocity 
		easeInCubic: function(t) {
			return t * t * t
		},
		// decelerating to zero velocity 
		easeOutCubic: function(t) {
			return (--t) * t * t + 1
		},
		// acceleration until halfway, then deceleration 
		easeInOutCubic: function(t) {
			return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
		},
		// accelerating from zero velocity 
		easeInQuart: function(t) {
			return t * t * t * t
		},
		// decelerating to zero velocity 
		easeOutQuart: function(t) {
			return 1 - (--t) * t * t * t
		},
		// acceleration until halfway, then deceleration
		easeInOutQuart: function(t) {
			return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
		},
		// accelerating from zero velocity
		easeInQuint: function(t) {
			return t * t * t * t * t
		},
		// decelerating to zero velocity
		easeOutQuint: function(t) {
			return 1 + (--t) * t * t * t * t
		},
		// acceleration until halfway, then deceleration 
		easeInOutQuint: function(t) {
			return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
		}
	}

	$('[data-count]').each(function() {
		var duration = 2000;
		var interval = Math.floor(duration / 60);
		var steps = Math.ceil(duration / interval);
		var $target = $(this);
		var offset = $target.offset().top;
		var max = $target.data('count');
		$target.html('0');
		var started = false;

		var startCounter = function() {
		    if (started) return;
		    
		    started = true;
			var i = 0,
				handle;
			handle = window.setInterval(function() {
				$target.html(Math.round(max * EasingFunctions.easeOutCubic(i / steps)));
				i++;
				if (i == steps) {
					$target.html(max);
					window.clearInterval(handle);
				}
			}, interval);
		};

		viewport.observe('scroll', function() {
			if ((viewport.getScrollTop() + viewport.getHeight() / 2) > offset) {
				startCounter();
			}
		});
	});
});
/* End JS for preset "Counter" */

/* JS for preset "Content Slider" */
$(function() {
	if (document.body.classList.contains('edit') || document.body.classList.contains('preview')) {
		return;
	}

	viewport.promise('api.slick.ready', function() {
		viewport.jQuery('.content-slider-wrap > .inner').slick({
			autoplay: true,
			arrows: true,
			prevArrow: '<button type="button" data-role="none" class="slick-prev" tabindex="0" role="button"></button>',
			nextArrow: '<button type="button" data-role="none" class="slick-next" tabindex="0" role="button"></button>',
			speed: 300,
			autoplaySpeed: 3000,
			dots: true,
			adaptiveHeight: true,
			fade: false
		});
	}).requireSlick();
});

/* End JS for preset "Content Slider" */