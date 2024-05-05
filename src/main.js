import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";

var platforms;
var player;
var cursors;
var stars;
var bombs;
var score = 0;
var scoreText;
var gameOver;

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

function preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", { frameWidth: 32, frameHeight: 48 });
}
function create() {
    this.add.image(400, 300, "sky");

    scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", fill: "#000" });

    stars = this.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); // 바운스 0 ~ 1 사이
    });

    function collectStar(player, star) {
        star.disableBody(true, true); // 줏어들인 별은 사라짐 (물리 비활성화)

        score += 10;
        scoreText.setText("Score: " + score);
    }

    platforms = this.physics.add.staticGroup();
    player = this.physics.add.sprite(100, 450, "dude");

    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(player, platforms); // 충돌 감지
    this.physics.add.overlap(player, stars, collectStar, null, this); // 겹침 감지 (플레이어, 별, 콜백함수, null, this)

    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(500);

    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
    });

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });

    function hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000); // 플레이어 색깔 변경

        player.anims.play("turn"); // 플레이어 애니메이션 변경

        gameOver = true;
    }

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}
function update() {
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play("left", true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play("right", true);
    } else {
        player.setVelocityX(0);

        player.anims.play("turn");
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-550);
    }

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, "bomb");
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

export default new Phaser.Game(config);
