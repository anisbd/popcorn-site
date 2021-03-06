var popcorn = {
    initialize: function() {
        this.polyfill();
        analytics.initialize({
            'Google Analytics' : {
                trackingId              : 'UA-38440155-3',
                domain                  : 'popcorntime.io',
                universalClient         :  true
            }
        });
        analytics.pageview();
        
        i18n.init({fallbackLng: 'en'}, function() {
	        $("html").i18n();
	        var desktop_version = $("#get-app").attr("data-version");
	        var android_version = $("#get-app").attr("data-version-android");
	        $(".download .btn-main").html(i18n.t("download.text", {postProcess: 'sprintf', sprintf: [desktop_version]}));
	        $(".download .btn-main.icon-android").html(i18n.t("download.text", {postProcess: 'sprintf', sprintf: [android_version]}));
        });
    },
    polyfill: function() {
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
            window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame']
                                       || window[vendors[i]+'CancelRequestAnimationFrame'];
        }
    },
    detectUA: function(platform, ua) {
        if (/Mac/.test(platform)) {
            return 'mac';
        } else if (/Win/.test(platform)) {
            return 'win';
        } else if (/Android/.test(ua)) {
            return 'android';
        } else if (/Lin/.test(platform)) {
            if (/x86_64/.test(platform)) {
                return 'lin-64';
            } else {
                return 'lin-32';
            }
        } else {
            return;
        }
    },
    updateDownloads: function(platform, ua) {
        document.body.className += ' ' + (this.detectUA(platform, ua) || 'nope');
    },
    updateStatus: function(el, url) {
        $.get(url, function(resp) {
            $(el).addClass(resp.status.indicator);
        }, 'json');
    },
    smoothScroll: function() {
        $('a[data-scroll][href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 800);
                    return false;
                }
            }
        });
    },
    snow: function() {
        /* Snow Parameters */
        var count = 75;
        var wind = { x: 2, y: 1 };

        var PI2 = Math.PI * 2;

        var particles = [];
        var width = window.innerWidth;
        var height = window.innerHeight;
        var halfWidth = width / 2;
        var mouse = { x: 0, y: 0 };
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.className = 'snow';

        setup();

        function setup() {
            for(var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,     // x-pos
                    y: Math.random() * height,    // y-pos
                    size: 1 + Math.random() * 3,    // radius
                    weight: Math.random() * count, // density
                    angle: Math.random() * 360
                });
            }

            handleResize();

            window.addEventListener('resize', handleResize);
            window.addEventListener('mousemove', handleMouseMove);

            if(window.orientation !== undefined) {
                window.addEventListener('deviceorientation', handleDeviceOrientation);
            }

            document.body.insertBefore(canvas, document.body.firstChild);
            window.requestAnimationFrame(render);
        }

        function handleResize() {
            width = window.innerWidth;
            height = window.innerHeight;
            halfWidth = width / 2;
            canvas.width = width;
            canvas.height = height;
        }

        function handleMouseMove(e) {
            mouse.x = e.x || e.clientX;
            mouse.y = e.y || e.clientY;
            wind.x = map(mouse.x - halfWidth, -halfWidth, halfWidth, 4, -4);
        }

        var once = true;
        function handleDeviceOrientation(e) {
            // Remove the mouse event listener and only use gyro
            if(e.gamma !== null) {
                if(!(window.orientation % 180)) {
                    wind.x = map(e.gamma, -60, 60, -4, 4);
                } else {
                    wind.x = map(e.beta, -60, 60, 4, -4);
                }

                if(once) {
                    window.removeEventListener('mousemove', mousemove);
                    once = false;
                }
            }
        }

        function render() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(250,250,250,0.8)';
            ctx.beginPath();
            for(var i = 0; i < count; i++) {
                var particle = particles[i];
                ctx.moveTo(particle.x, particle.y);
                ctx.arc(particle.x, particle.y, particle.size, 0, PI2, true);
            }
            ctx.fill();
            update();
            requestAnimationFrame(render);
        }

        function map(x, in_min, in_max, out_min, out_max) {
            return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }

        function update() {
            for(var i = 0; i < count; i++) {
                var particle = particles[i];
                particle.angle += 0.01;
                particle.y += Math.cos(particle.weight) + wind.y + particle.size / 2;
                particle.x += Math.sin(particle.angle) + wind.x;

                if(particle.x > width + 5 || particle.x < -5 ||
                   particle.y > height)
                {
                    if(i % 3 > 0) {
                        particle.x = Math.random() * width;
                        particle.y = -5;
                    } else {
                        //If the flake is exitting from the right
                        if(particle.x > halfWidth) {
                            //Enter from the left
                            particle.x = -5;
                            particle.y = Math.random() * height;
                        } else {
                            //Enter from the right
                            particle.x = width + 5;
                            particle.y = Math.random() * height;
                        }
                    }
                }
            }
        }
    }
};

popcorn.initialize();
popcorn.updateDownloads(navigator.platform, navigator.userAgent);
popcorn.updateStatus('#status', 'https://popcorntime.statuspage.io/api/v1/status.json');
popcorn.smoothScroll();
if((mnth = new Date().getMonth()) === 11 || mnth === 0) {
    popcorn.snow();
}
