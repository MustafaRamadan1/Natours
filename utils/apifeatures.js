class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter(){

      const queryObject = {...this.queryString};

      const exculdedFields = ['sort', 'page','limit', 'fields'];

      exculdedFields.forEach((e)=> delete queryObject[e]);

      let filterObj = JSON.stringify(queryObject);

      filterObj = filterObj.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

      this.query = this.query.find(JSON.parse(filterObj));

      return this;

    }
  

    sort(){
       if (this.queryString.sort)
       {
        this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
       }
       else
       {
        this.query = this.query.sort('-createdAt')
       }
       return this;
  
    }
  
    limitField(){
  
       if (this.queryString.fields)
       {
        console.log('we are in the limit field');
          const fields = `${this.queryString.fields.split(',').join(' ')} -_id`;
  
          this.query = this.query.select(fields);
       }
       else
       {
        this.query = this.query.select('-__v');
       }
       return this;
  
    }
  
  
    paginate (limitperPage){
  
      const page = this.queryString.page * 1 || 1;
  
       const limit = this.queryString.limit * 1 || limitperPage;
  
       const skip = (page - 1) * limit;

       if (this.queryString.page || this.queryString.limit)  this.query = this.query.skip(skip).limit(limit);
  
       return this;
  
    }
  }


  module.exports = APIFeatures;