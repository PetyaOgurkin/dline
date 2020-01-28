export default function toGeoJson() {

    const pointGrid = {
        "type": "FeatureCollection",
        "features": []
    }

    for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[i].length; j++) {
            if (this.grid[i][j]) {
                pointGrid.features.push({
                    "type": "Feature",
                    "properties": { "value": this.grid[i][j] },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [j * this.longCellSize + this.bbox[0], i * this.latCellSize + this.bbox[1]]
                    }
                })
            }
        }
    }

    return pointGrid
}