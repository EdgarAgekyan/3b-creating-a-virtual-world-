class Camera {
    constructor(canvas) {
        this.fov = 60;
        this.speed = .1;
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);

        this.viewMatrix = new Matrix4();
        this.updateLookAt();

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);

    }

    // Added this so I don't have to repeat this line too many times
    updateLookAt() {
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2],
        )
    }

    moveForward() {
        // New forward vector
        this.forwardVec = new Vector3(this.at.elements);

        // f = at - eye
        this.forwardVec.sub(this.eye);

        this.forwardVec.normalize();

        // Scale speed
        this.forwardVec.mul(this.speed);

        // Add forward vector to eye and center
        this.eye.add(this.forwardVec);
        this.at.add(this.forwardVec);

        this.updateLookAt();
    }

    moveBackwards() {
        this.backwardsVec = new Vector3(this.eye.elements);

        // f = at - eye
        this.backwardsVec.elements[0] -= this.at.elements[0];
        this.backwardsVec.elements[1] -= this.at.elements[1];
        this.backwardsVec.elements[2] -= this.at.elements[2];

        this.backwardsVec.normalize();

        // Scale speed
        this.backwardsVec.elements[0] *= this.speed;
        this.backwardsVec.elements[1] *= this.speed;
        this.backwardsVec.elements[2] *= this.speed;

        // Add forward vector to eye and center
        this.eye.elements[0] += this.backwardsVec.elements[0];
        this.eye.elements[1] += this.backwardsVec.elements[1];
        this.eye.elements[2] += this.backwardsVec.elements[2];
        this.at.elements[0] += this.backwardsVec.elements[0];
        this.at.elements[1] += this.backwardsVec.elements[1];
        this.at.elements[2] += this.backwardsVec.elements[2];

        this.updateLookAt();        
    }

    moveLeft() {
        // New forward vector
        this.forwardVec = new Vector3(this.at.elements);

        // f = at - eye
        this.forwardVec.elements[0] -= this.eye.elements[0];
        this.forwardVec.elements[1] -= this.eye.elements[1];
        this.forwardVec.elements[2] -= this.eye.elements[2];

        this.sideVec = new Vector3(this.up.elements);


        this.forwardVec.normalize();


    }

    right() {
        var f = this.at.sub(this.eye);
        f = f.divide(f.length());
        var s = f.cross(this.up);
        s = s.divide(s.length());
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }

}
