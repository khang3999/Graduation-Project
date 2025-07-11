const formatScore = (score) => {
    const num = parseFloat(score) || 0; 

    if (num < 0) {
      return '-' + formatScore(Math.abs(num)); 
    }

    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      return num.toString();
    }
};

export default formatScore;
