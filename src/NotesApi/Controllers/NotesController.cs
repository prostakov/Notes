using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApi.Models;

namespace NotesApi.Controllers
{
    [ApiController]
    [Route("/notes")]
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public NotesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<NoteModel[]> Get()
        {
            var models = await _dbContext.Notes.ToArrayAsync();
            return models;
        }

        [HttpPut]
        public async Task<NoteModel> CreateOrUpdate(NoteModel updateModel)
        {
            var model = await _dbContext.Notes.SingleOrDefaultAsync(x => x.Id == updateModel.Id);
            
            if (model == null)
            {
                model = updateModel;
                model.CreatedAt = DateTime.UtcNow;
                model.UpdatedAt = DateTime.UtcNow;
                await _dbContext.Notes.AddAsync(model);   
            }
            else
            {
                model.Text = model.Text;
                model.UpdatedAt = DateTime.UtcNow;
            }
            await _dbContext.SaveChangesAsync();
            
            return model;
        }
    }
}