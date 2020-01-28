export default function toAsc() {
    let out = `ncols         ${((this.bbox[2] - this.bbox[0]) / this.longCellSize).toFixed()}
nrows         ${((this.bbox[3] - this.bbox[1]) / this.latCellSize).toFixed()}
xllcorner     ${this.bbox[0]}
yllcorner     ${this.bbox[1]}
cellsize      ${this.latCellSize}
NODATA_value  -9999
`

    for (let i = this.grid.length - 1; i >= 0; i--) {
        out += ' ' + this.grid[i].join(' ') + '\n';
    }

    return out;
}