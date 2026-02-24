package com.ittest.controller;

import com.ittest.pojo.Article;
import com.ittest.pojo.Category;
import com.ittest.pojo.Result;
import com.ittest.pojo.User;
import com.ittest.service.ArticleService;
import com.ittest.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Update;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/article")
public class ArticleController {
    @Autowired
    private ArticleService articleService;
    @PostMapping
   public Result add(@RequestBody @Validated Article article){
      articleService.add(article);
      return Result.success();
   }

    @GetMapping("/list")
    public Result<List<Article>> list(@RequestParam Integer categoryId){
        System.out.print(categoryId);
        List<Article> cs=articleService.list(categoryId);
        return Result.success(cs);
    }

    @GetMapping("/detail")
    public Result<Article> article(@RequestParam Integer articleId){
        Article a=articleService.article(articleId);
        return Result.success(a);
    }

    @PutMapping("/update")
    public Result update(@RequestBody @Validated Article article){
        articleService.update(article);
        return Result.success();
    }

    @DeleteMapping("/delete")
    public Result delete(@RequestParam Integer id){
        articleService.delete(id);
        return Result.success();
    }
}
