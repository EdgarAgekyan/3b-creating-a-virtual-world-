class Camera {
    constructor(canvas) {
        this.fov = 60;
        this.speed = .1;
        this.alpha = 3;
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

        // f = eye - at
        this.backwardsVec.sub(this.at);

        this.backwardsVec.normalize();

        // Scale speed
        this.backwardsVec.mul(this.speed);

        // Add forward vector to eye and center
        this.eye.add(this.backwardsVec);
        this.at.add(this.backwardsVec);

        this.updateLookAt();        
    }

    moveLeft() {
        // New forward vector
        this.leftVec = new Vector3(this.at.elements);

        // f = at - eye
        this.leftVec.sub(this.eye);

        this.sideVec = new Vector3();

        this.sideVec = Vector3.cross(this.up, this.leftVec);

        this.sideVec.normalize();

        this.sideVec.mul(this.speed);

        this.eye.add(this.sideVec);
        this.at.add(this.sideVec);

        this.updateLookAt();        

    }

    moveRight() {
        // New forward vector
        this.rightVec = new Vector3(this.eye.elements);

        // f = at - eye
        this.rightVec.sub(this.at);

        this.sideVec = new Vector3();

        this.sideVec = Vector3.cross(this.up, this.rightVec);

        this.sideVec.normalize();

        this.sideVec.mul(this.speed);

        this.eye.add(this.sideVec);
        this.at.add(this.sideVec);

        this.updateLookAt();        

    }

    panLeft() {
        // New forward vector
        this.panLeftVec = new Vector3(this.at.elements);

        // f = at - eye
        this.panLeftVec.sub(this.eye);

        this.rotationMatrix = new Matrix4();
        this.f_prime;

        this.rotationMatrix.setRotate(this.alpha,this.up.elements[0],this.up.elements[1],this.up.elements[2]);

        this.f_prime = this.rotationMatrix.multiplyVector3(this.panLeftVec);

        this.at.set(this.eye);

        this.at.add(this.f_prime);

        this.updateLookAt();     
    }

    panRight() {
        this.panRightVec = new Vector3(this.at.elements);

        // f = at - eye
        this.panRightVec.sub(this.eye);

        this.rotationMatrix = new Matrix4();
        this.f_prime;

        this.rotationMatrix.setRotate(-this.alpha,this.up.elements[0],this.up.elements[1],this.up.elements[2]);

        this.f_prime = this.rotationMatrix.multiplyVector3(this.panRightVec);

        this.at.set(this.eye);

        this.at.add(this.f_prime);

        this.updateLookAt();
    }

    lookUp() {

    }

    lookDown() {

    }

    lookUpAndDown(newAlpha) {

    }

    lookLeftAndRight(newAlpha) {
        // New forward vector
        this.panLeftVec = new Vector3(this.at.elements);

        // f = at - eye
        this.panLeftVec.sub(this.eye);

        this.rotationMatrix = new Matrix4();
        this.f_prime;

        this.rotationMatrix.setRotate(newAlpha, this.up.elements[0],this.up.elements[1],this.up.elements[2]);

        this.f_prime = this.rotationMatrix.multiplyVector3(this.panLeftVec);

        this.at.set(this.eye);

        this.at.add(this.f_prime);

        this.updateLookAt();
    }

    lookRight() {

    }

}
