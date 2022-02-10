const canvas = document.querySelector('canvas')
const scoreEl = document.querySelector('#scoreEl')

// Canvas context
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// Player class with properties
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

// Projectile class
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.color = color
        this.velocity = velocity
        this.radius = radius
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.color = color
        this.velocity = velocity
        this.radius = radius
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const FRICTION = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.color = color
        this.velocity = velocity
        this.radius = radius
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= FRICTION
        this.velocity.y *= FRICTION
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 10, 'white')
player.draw()

const projectiles = []
const enemies = []
const particles = []

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 6) + 6
        let x, y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }


        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}


let animationId
let score = 0
/**
 * Animates all the movements and actions on the canvas
 */
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, particleI) => {
        if (particle.alpha <= 0)
            particles.splice(particleI, 1)
        else
            particle.update()
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        // Delete projectile when it goes off-screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, enemyI) => {
        enemy.update()

        // Check if enemy has touched the player
        const distPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (distPlayer - enemy.radius - player.radius < 0) {
            // End
            cancelAnimationFrame(animationId)
        }

        projectiles.forEach((projectile, projectileI) => {
            // Check if a projectile has touched the enemy
            const distProjectile = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (distProjectile - enemy.radius - projectile.radius < -1) {
                // Update score
                score += 100
                scoreEl.innerHTML = score

                // Create explosions
                for (let i = 0; i < enemy.radius * 1.5; i++) {
                    particles.push(new Particle(
                        enemy.x,
                        enemy.y,
                        Math.random() * 2,
                        enemy.color,
                        { x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8) }
                    ))
                }
                if (enemy.radius - 10 > 5) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileI, 1)
                    }, 0)
                }
                else {
                    setTimeout(() => {
                        enemies.splice(enemyI, 1)
                        projectiles.splice(projectileI, 1)
                    }, 0)
                }
            }
        })
    })
}

// Event listener for click events on canvas
// Creates new projectile which will move in the direction of the click
// from the center/player.
addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }
    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
    ))
})

animate()
spawnEnemies()