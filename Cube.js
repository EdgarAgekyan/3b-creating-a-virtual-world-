class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.cubeVerts32 = new Float32Array([
            0, 0, 0, 1, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 1, 0, 1, 1, 0,
            0, 1, 0, 0, 1, 1, 1, 1, 1,
            0, 1, 0, 1, 1, 1, 1, 1, 0,

            1, 1, 0, 1, 1, 1, 1, 0, 0,
            1, 0, 0, 1, 1, 1, 1, 0, 1,
            0, 1, 0, 0, 1, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 1, 0, 0, 1,

            0, 0, 0, 0, 0, 1, 1, 0, 1,
            0, 0, 0, 1, 0, 1, 1, 0, 0,
            0, 0, 1, 1, 1, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 1, 1, 1,
        ]);
        this.cubeVerts = [
            0, 0, 0, 1, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 1, 0, 1, 1, 0,
            0, 1, 0, 0, 1, 1, 1, 1, 1,
            0, 1, 0, 1, 1, 1, 1, 1, 0,

            1, 1, 0, 1, 1, 1, 1, 0, 0,
            1, 0, 0, 1, 1, 1, 1, 0, 1,
            0, 1, 0, 0, 1, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 1, 0, 0, 1,

            0, 0, 0, 0, 0, 1, 1, 0, 1,
            0, 0, 0, 1, 0, 1, 1, 0, 0,
            0, 0, 1, 1, 1, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 1, 1, 1,
        ];

        // Found out I was doing uv coords wrong and fixed it here
        this.uvVerts32 = new Float32Array([
            // Front
            0, 0, 1, 1, 1, 0,
            0, 0, 0, 1, 1, 1,

            // Back
            1, 0, 0, 1, 0, 0,
            1, 0, 1, 1, 0, 1,

            // Top
            0, 1, 0, 0, 1, 0,
            0, 1, 1, 1, 1, 0,

            // Bottom
            0, 0, 1, 1, 1, 0,
            0, 0, 0, 1, 1, 1,

            // Right
            0, 0, 1, 1, 1, 0,
            0, 0, 0, 1, 1, 1,

            // Left
            1, 0, 0, 1, 0, 0,
            1, 0, 1, 1, 0, 1
        ]);

        // this.uvVerts = [
        //     0,0, 1,1, 1,0,
        //     0,0, 0,1, 1,1,
        //     0,0, 1,1, 1,0,
        //     0,0, 0,1, 1,1,
        //     0,1, 0,1, 1,1,
        //     0,1, 1,1, 1,1,
        //     0,0, 0,0, 1,0,
        //     0,0, 1,0, 1,0,
        //     0,0, 0,1, 0,0,
        //     0,0, 0,1, 0,1,
        //     1,0, 1,1, 1,0,
        //     1,0, 1,1, 1,1
        // ];
    }
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Got some help from ChatGPT for these UV coords (and the one used above)
        // Followed along with lecture videos but got a little confused along the way
        // Edited left and right primarily, those took a while

        // Front
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);


        // Top
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);

        // Right
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 0, 0, 1], [1, 1, 0, 1, 0, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0]);


        // Left
        drawTriangle3DUV([1, 0, 0, 1, 1, 0, 1, 0, 1], [1, 0, 1, 1, 0, 0]);
        drawTriangle3DUV([1, 1, 0, 1, 1, 1, 1, 0, 1], [1, 1, 0, 1, 0, 0]);

        // Bottom
        drawTriangle3DUV([0, 0, 0, 0, 0, 1, 1, 0, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0]);

        // Back
        drawTriangle3DUV([0, 0, 1, 1, 1, 1, 1, 0, 1], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 1, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);

        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);




    }
    renderfast() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, -2);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];

        // Front of cube
        allverts = allverts.concat([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        allverts = allverts.concat([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        // Top of cube
        allverts = allverts.concat([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        allverts = allverts.concat([0, 1, 0, 1, 1, 1, 1, 1, 0]);

        // Right of cube
        allverts = allverts.concat([1, 1, 0, 1, 1, 1, 1, 0, 0,]);
        allverts = allverts.concat([1, 0, 0, 1, 1, 1, 1, 0, 1]);

        // Left of cube
        allverts = allverts.concat([0, 1, 0, 0, 1, 1, 0, 0, 0]);
        allverts = allverts.concat([0, 0, 0, 0, 1, 1, 0, 0, 1]);

        // Bottom of cube
        allverts = allverts.concat([0, 0, 0, 0, 0, 1, 1, 0, 1]);
        allverts = allverts.concat([0, 0, 0, 1, 0, 1, 1, 0, 0]);

        // Back of cube
        allverts = allverts.concat([0, 0, 1, 1, 1, 1, 1, 0, 1]);
        allverts = allverts.concat([0, 0, 1, 0, 1, 1, 1, 1, 1]);

        drawTriangle3D(allverts);

        // console.log("test vert:", allverts);

    }

    renderfaster() {

        var rgba = this.color;

        // No longer hardcoded texture
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null || g_uvBuffer == null) {
            initTriangle3D();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvVerts32, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);


        // gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 36);

    }
}