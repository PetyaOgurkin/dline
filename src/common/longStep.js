function longStep() {
      // радиус земли в метрах
      const Earth = 6372795;

      // переводим координаты из градусов в радианы
      const lat1 = D1[0] * Math.PI / 180;
      const lat2 = D2[0] * Math.PI / 180;
      const long1 = D1[1] * Math.PI / 180;
      const long2 = D2[1] * Math.PI / 180;
  
      // расстояние между точками в градусах
      const d = LongOrLat === "Long" ? Math.abs(D1[1] - D2[1]) : LongOrLat === "Lat" ? Math.abs(D1[0] - D2[0]) : NaN;
  
      // считаем расстояние между точками
      const Distance = Earth * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(long1 - long2));
      return d * L / Distance;
}
