'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var win32 = process.platform === 'win32';


module.exports = AppGenerator;

function AppGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        if (options['skip-install']) {
            console.log('\n\nI\'m all done. Don\'t forget to make app/storage writable. Just run ' + 'npm install & bower install --dev & composer install'.bold.yellow + ' to install the required dependencies.\n\n');
        } else {
            console.log('\n\nI\'m all done. Don\'t forget to make app/storage writable. Running ' + 'npm install, bower install and composer install'.bold.yellow + ' for you to install the required dependencies. If this fails, try running the command yourself.\n\n');
            spawn(win32 ? 'cmd' : 'npm', [win32 ? '/c npm install' : 'install'], { stdio: 'inherit' });
            spawn(win32 ? 'cmd' : 'bower', [win32 ? '/c bower install' : 'install'], { stdio: 'inherit' });
            spawn(win32 ? 'cmd' : 'composer', [win32 ? '/c composer install' : 'install'], { stdio: 'inherit' });
            spawn(win32 ? 'cmd' : 'chmod', [win32 ? '' : { '777', 'app/storage' }], { stdio: 'inherit' });
        }
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    this.folklore = this.read('folklore.txt');
}

util.inherits(AppGenerator, yeoman.generators.NamedBase);

AppGenerator.prototype.askFor = function askFor(name) {
    var cb = this.async();

    // welcome message
    console.log('\n\n'+this.folklore.green);
    console.log('Laravel4 Boilerplate');
    console.log('\n\n');

    if(!name || !name.length) {
        var prompts = [{
            name: 'projectHost',
            message: 'What is the (local, generally) hostname of your project?'
        }];

        this.prompt(prompts, function (err, props) {
            if (err) {
                return this.emit('error', err);
            }

            this.projectHost = props.projectHost.toLowerCase();

            cb();
        }.bind(this));
    } else {
        this.projectHost = name;
        cb();
    }
};

AppGenerator.prototype.fetchGit = function fetchGit() {
    this.tarball('https://github.com/laravel/laravel/tarball/master', '.', this.async());
};

AppGenerator.prototype.gruntfile = function gruntfile() {
    this.template('Gruntfile.js','Gruntfile.js',{
        projectHost : this.projectHost
    });
};

AppGenerator.prototype.packageJSON = function packageJSON() {
    this.template('_package.json','package.json',{
        projectHost : this.projectHost
    });
};

AppGenerator.prototype.bowerJSON = function componentJSON() {
    this.template('_bower.json','bower.json',{
        projectHost : this.projectHost
    });
};

AppGenerator.prototype.structure = function structure() {
      this.mkdir('public/css');
      this.mkdir('public/css/fonts');
      this.mkdir('public/img');
      this.mkdir('public/scss');
};

AppGenerator.prototype.mainJS = function mainJS() {
    this.copy('main.js','public/js/main.js');
};

AppGenerator.prototype.mainSCSS = function mainSCSS() {
    this.copy('main.scss','public/scss/main.scss');
};

AppGenerator.prototype.misc = function misc() {
    this.copy('gitignore','.gitignore');
    this.copy('gitattributes','.gitattributes');
    this.copy('editorconfig','.editorconfig');
    this.copy('jshintrc','.jshintrc');
    this.copy('bowerrc','.bowerrc');
};


